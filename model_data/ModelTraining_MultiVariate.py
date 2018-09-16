#this is the one with multi variable, test of rmse, r^2, etc.
#from here we deduce the coeff and intercept, our model is essentially built
from sklearn import linear_model
from sklearn import metrics
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
import pickle


df = pd.read_csv('../raw_data/DataPredix.csv',index_col=0)
DataForAugust = pd.read_csv('./DataPredixForAug18.csv',index_col=0)

#process for train
targV=df._getitem_column("targVar")
df.drop(['targVar'], axis=1, inplace=True)

lm = linear_model.LinearRegression(normalize=True)
model = lm.fit(df,targV)

#process for test
testTargVar=DataForAugust._getitem_column("targVar")
DataForAugust.drop(['targVar'], axis=1, inplace=True)

# Predict
y_pred = lm.predict(DataForAugust)

# Evaluate
# this are the intercepts and coeff
print(lm.coef_,lm.intercept_)

#rsquare
rSquare=lm.score(df,targV)
#R mean square error
rootMeanSquareError=np.sqrt(metrics.mean_squared_error(testTargVar, y_pred))
#explained V score
explainedVarianceScore=metrics.explained_variance_score(testTargVar, y_pred)

filename = 'finalized_model.sav'
pickle.dump(lm, open(filename, 'wb'),protocol=2)
