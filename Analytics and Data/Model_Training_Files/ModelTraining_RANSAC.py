#alternate reg using RANSAC, doesnt work as well

from sklearn import metrics
from sklearn import linear_model
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
import pickle

df = pd.read_csv('../raw_data/DataPredix.csv',index_col=0)
DataForAugust = pd.read_csv('./DataPredixForAug18.csv',index_col=0)

#process for train
targV=df._getitem_column("targVar")
df.drop(['targVar'], axis=1, inplace=True)
print(df.columns)

lm = linear_model.RANSACRegressor()
model = lm.fit(df,targV)

#process for test
testTargVar=DataForAugust._getitem_column("targVar")
DataForAugust.drop(['targVar'], axis=1, inplace=True)

# Predict
y_pred = lm.predict(DataForAugust)
print(y_pred[0:300])


#rsquare
print("rsquare=",lm.score(df,targV))
#root mean square error
print("Root mean square error(with train test split)=",np.sqrt(metrics.mean_squared_error(testTargVar, y_pred)))
print(metrics.explained_variance_score(testTargVar, y_pred))

print(lm.n_trials_)

#save model to SAV
filename = 'modelUsingRANSACRobustReg.sav'
pickle.dump(lm, open(filename, 'wb'),protocol=2)
