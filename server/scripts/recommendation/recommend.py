import sys
import pandas as pd
import numpy as np
import pickle
import json

import util


def recommend_settings(model_dump, survey_json):
    model = pickle.loads(model_dump)
    survey_answers = pd.DataFrame(json.loads(survey_json)).T
    measures = util.calc_measures_from_survey(survey_answers)

    def search_settings_combinations(combinations, settings):
        column = util.SETTING_COLUMNS[len(settings)]
        for setting_value in util.SETTINGS_CATEGORIES[column]:
            new_settings = settings.copy()
            new_settings[column] = setting_value
            if len(new_settings) == len(util.SETTING_COLUMNS):
                combinations.append(new_settings)
            else:
                search_settings_combinations(combinations, new_settings)

    settings_combinations = []
    search_settings_combinations(settings_combinations, {})

    predictions = pd.DataFrame()
    for settings in settings_combinations:
        user = measures.assign(**settings)
        user_with_dummies = util.create_dummy_variables_for_settings(user)
        performance = model.predict(user_with_dummies)
        predictions = predictions.append(user.assign(performance=performance))

    best_prediction = predictions.sort_values('performance', ascending=False).iloc[0]

    result = {}
    for setting_key in util.SETTING_COLUMNS:
        performance_summary = (predictions
            .groupby(predictions[setting_key] == best_prediction[setting_key])
            .agg({'performance': 'mean'})
            ['performance'])
        confidence = performance_summary[True] - performance_summary[False]
        result[setting_key] = {
            'value': best_prediction[setting_key],
            'confidence': confidence
        }

    print(json.dumps(result, cls=NumpyJSONEncoder))

class NumpyJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.bool_):
            return obj.item()
        return json.JSONEncoder.default(self, obj)

if __name__ == '__main__':
    survey_json = sys.argv[1]
    model_dump = sys.stdin.buffer.read()
    recommend_settings(model_dump, survey_json)
