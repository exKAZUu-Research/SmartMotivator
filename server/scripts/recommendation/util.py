from datetime import timezone
import pandas as pd
from pandas.api.types import CategoricalDtype
import json


SETTINGS_CATEGORIES = {
    'pointType': ['absolute', 'self', 'other'],
    'positiveFraming': [True, False],
    'praiseEffort': [True, False],
}
SETTING_COLUMNS = list(SETTINGS_CATEGORIES.keys())

def set_time_and_date(data):
    data['time'] = (pd.to_datetime(data['time'])
        .dt.tz_localize('UTC')
        .dt.tz_convert('Asia/Tokyo'))
    data['date'] = data['time'].dt.date
    return data

def extract_settings(settings_column):
    return settings_column.apply(pd.Series)

def create_dummy_variables_for_settings(data):
    new_data = data.copy()
    for column in SETTING_COLUMNS:
        new_data[column] = pd.Categorical(new_data[column], categories=SETTINGS_CATEGORIES[column])
    return pd.get_dummies(new_data, columns=SETTING_COLUMNS)

def calc_measures_from_survey(raw_survey_answers):
    survey_answers = raw_survey_answers.copy()

    reversed_questions = {13, 15, 26, 31, 43, 49, 54}
    normal_questions = set(range(66)) - reversed_questions
    raw_questions = {66, 67}

    normal_questions_list = list(normal_questions)
    survey_answers[normal_questions_list] = 7 - survey_answers[normal_questions_list]
    other_questions_list = list(reversed_questions | raw_questions)
    survey_answers[other_questions_list] = 1 + survey_answers[other_questions_list]

    measures_to_questions = [
        [26, 31], # m1: 防衛的悲観主義の尺度_過去のパフォーマンスの評価（学習）
        [1, 46], # m2: 防衛的悲観主義の尺度_方略的楽観主義者
        [18, 55], # m3: 防衛的悲観主義の尺度_対処的悲観主義者（学習）
        [19, 38], # m4: 課題価値の尺度_(実践的)利用価値
        [21, 50], # m5: 自己決定意識の尺度_自己決定志向性
        [23, 48], # m6: 自己決定意識の尺度_他者決定選好の少なさ
        [14, 45], # m7: 自己意識理論の尺度_公的自意識
        [13, 49], # m8: 自尊感情の尺度_単一尺度
        [30, 43], # m9: 社会的望ましさの尺度_バランス型社会的望ましさ(印象操作)
        [29, 56], # m10: 目標志向性の尺度_遂行接近目標志向
        [8, 32], # m11: 目標志向性の尺度_遂行回避目標志向
        [24, 44], # m12: 目標志向性の尺度_マスタリー目標志向
        [9, 34], # m13: 特性的自己効力感の尺度_単一尺度(行動を起こす意志)
        [5, 51], # m14: 特性的自己効力感の尺度_単一尺度(行動を完了しようと努力する意志)
        [20, 37], # m15: 暗黙の知能観の尺度_実態的知能観
        [4, 42], # m16: 暗黙の知能観の尺度_増大的知能観
        [0, 57, 63], # m17: 承認欲求の尺度_賞賛獲得欲求
        [12, 39], # m18: 承認欲求の尺度_注目欲求
        [2, 40], # m19: 承認欲求の尺度_拒否回避欲求
        [16, 33], # m20: 学習方略の尺度_計画
        [3, 61], # m21: 多面的競争心の尺度_負けず嫌い
        [11, 60], # m22: 多面的競争心の尺度_競争回避
        [25, 36, 65], # m23: 多面的競争心の尺度_手段型競争心
        [27, 47], # m24: 原因帰属理論の尺度_内的統制
        [22, 35], # m25: 協調性の尺度_協同志向因子
        [28, 52], # m26: 協調性の尺度_互恵懸念因子
        [10, 58, 64], # m27: 制御焦点理論の尺度_損失回避（損失の不在）
        [17, 41], # m28: 制御焦点理論の尺度_利得接近（利得の存在）
        [6, 53], # m29: 一般的性格の尺度_外向性
        [7, 59, 62], # m30: やり抜く力の尺度_根気尺度
        [15, 54], # m31: やり抜く力の尺度_一貫性尺度
        [66], # m32: 性別
        [67], # m33: 年齢
    ]

    measures = pd.DataFrame()
    for measure_id in range(len(measures_to_questions)):
        question_ids = measures_to_questions[measure_id]
        measure_values = survey_answers[question_ids].sum(axis='columns')
        kwargs = {'m{0}'.format(measure_id + 1): measure_values}
        measures = measures.assign(**kwargs)
    return measures
