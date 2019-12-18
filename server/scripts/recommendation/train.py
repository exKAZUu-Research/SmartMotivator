import sys
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import pickle
import json
import datetime

import util


MAX_USER_DURATION = 30
MIN_REQUIRED_USER_DURATION = 7
MIN_DATE = datetime.date(2017, 3, 6)
MAX_DATE = datetime.date(2999, 12, 31)

class NotEnoughDataError(Exception):
    pass

def load_data_and_train_model(users_file, user_data_file):
    try:
        raw_users = pd.read_csv(users_file, index_col=0)
        raw_users.index.names = ['user_id']

        if raw_users.shape[0] == 0:
            raise NotEnoughDataError('ユーザが存在しません')

        user_data = pd.read_csv(user_data_file, index_col=0)
        user_data = util.set_time_and_date(user_data)
        user_data = user_data[user_data['date'] >= MIN_DATE]

        if user_data.shape[0] == 0:
            raise NotEnoughDataError('ユーザの行動ログが存在しません')

        users = create_users_with_settings(raw_users, user_data)
        users = set_measures(users, user_data)
        users = set_answer_count(users, user_data)

        model = train_model(users)
        model_dump = pickle.dumps(model)
        return model_dump

    except NotEnoughDataError as err:
        sys.exit(err)

def create_users_with_settings(raw_users, user_data):
    settings_logs = user_data.query('kind == "logSetting"')
    settings_logs = settings_logs[['user_id', 'value', 'date', 'time']]

    if settings_logs.shape[0] == 0:
        raise NotEnoughDataError('ユーザが機能設定をしたログが存在しません')

    settings_column = (settings_logs['value']
        .apply(json.loads)
        .apply(pd.Series)['setting'])
    settings_logs = (settings_logs
        .join(settings_column.apply(pd.Series))
        .drop('value', axis='columns'))

    active_settings = (settings_logs
        .sort_values(['date', 'time'])
        .drop_duplicates(['user_id', 'date'], keep='last')
        .groupby('user_id')
        .apply(lambda df: df.assign(next_settings_date=df['date'][1:df.shape[0]].append(pd.Series(MAX_DATE)).values)))
    active_settings = (active_settings
        .assign(end_date=np.minimum(active_settings['next_settings_date'], (active_settings['date'] + datetime.timedelta(MAX_USER_DURATION))) - datetime.timedelta(days=1))
        .drop('next_settings_date', axis='columns')
        .set_index(['user_id', 'date']))

    users = raw_users.join(active_settings, how='inner')
    return users

def set_measures(users, user_data):
    surveys = (user_data
        .query('kind == "survey"')
        .drop_duplicates('user_id')
        .set_index('user_id'))

    if surveys.shape[0] == 0:
        raise NotEnoughDataError('ユーザが心理アンケートに回答したログが存在しません')

    survey_answers = (surveys['value']
        .apply(json.loads)
        .apply(pd.Series))
    measures = util.calc_measures_from_survey(survey_answers)

    num_questions = survey_answers.shape[1]
    invalid_survey = (
        (pd.isnull(users['survey_started_at'])) |
        (pd.isnull(users['survey_finished_at'])) |
        ((pd.to_datetime(users['survey_finished_at']) - pd.to_datetime(users['survey_started_at'])).dt.seconds < num_questions * 2) |
        (survey_answers.apply(lambda row: row.value_counts().iloc[0] >= 68 * 2 / 3, axis='columns'))
    )

    new_users = (users
        .join(measures, how='inner')
        .query('~@invalid_survey'))

    if new_users.shape[0] == 0:
        raise NotEnoughDataError('心理アンケートに有効な回答をしたユーザが存在しません')

    return new_users

def set_answer_count(users, user_data):
    quiz_answers = user_data.query('kind == "quiz"')

    if quiz_answers.shape[0] == 0:
        raise NotEnoughDataError('ユーザが問題に回答したログが存在しません')

    quiz_answers = quiz_answers.assign(value=quiz_answers['value'].apply(json.loads))
    quiz_answers = quiz_answers.assign(
        total_answer_count=quiz_answers['value'].apply(lambda v: len(v['answers']))
    )
    users_date_ranges = (users
        .reset_index()
        .rename(columns={'index': 'user_id', 'date': 'user_start_date', 'end_date': 'user_end_date'})
        [['user_id', 'user_start_date', 'user_end_date']])
    quiz_answer_summary = (quiz_answers
        .groupby(['user_id', 'date'], as_index=False)
        .agg({'total_answer_count': 'sum'})
        .merge(users_date_ranges, on='user_id'))
    quiz_answer_summary = (quiz_answer_summary
        [(pd.to_datetime(quiz_answer_summary['user_start_date']).dt.date <= quiz_answer_summary['date']) &
        (pd.to_datetime(quiz_answer_summary['user_end_date']).dt.date >= quiz_answer_summary['date'])]
        .groupby(['user_id', 'user_start_date'], as_index=False)
        .agg({'total_answer_count': 'sum'})
        .rename(columns={'user_start_date': 'date'})
        .set_index(['user_id', 'date']))
    users = users.join(quiz_answer_summary, how='inner')

    if users.shape[0] == 0:
        raise NotEnoughDataError('有効期間中に問題に回答したユーザが存在しません')

    users = users.assign(total_answer_count_log=np.log(np.maximum(users['total_answer_count'], 1)))
    course_summary = (users
        .groupby('course')
        ['total_answer_count_log']
        .agg(['mean', 'std'])
        .fillna(1))
    total_answer_count_std = ((users['total_answer_count_log'].values - course_summary.loc[users['course'], 'mean'].values)
        / course_summary.loc[users['course'], 'std'].values)
    users = (users
        .assign(total_answer_count_std=total_answer_count_std)
        .drop('total_answer_count_log', axis='columns'))

    return users

def train_model(users):
    measure_columns = users.columns[users.columns.str.match('^m[0-9]+$')].tolist()
    x_columns = measure_columns + util.SETTING_COLUMNS
    y_column = 'total_answer_count_std'
    users = users.dropna(subset=(x_columns + [y_column]))

    if users.shape[0] == 0:
        raise NotEnoughDataError('訓練データとして使用できるユーザが存在しません')

    users = users.apply(pd.Series) # dtypeをセットし直して、util.create_dummy_variables_for_settings内のpd.Categoricalでの型不整合エラーを防ぐ
    x = users[x_columns]
    x = util.create_dummy_variables_for_settings(x)
    y = users[y_column]

    model = RandomForestRegressor(n_estimators=500)
    model = model.fit(x, y)
    return model

if __name__ == '__main__':
    users_file, user_data_file = sys.argv[1:]
    model_dump = load_data_and_train_model(users_file, user_data_file)
    sys.stdout.buffer.write(model_dump)
