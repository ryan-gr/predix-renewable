# PreProcessing of raw Data
contains:
  60030099999.csv-raw data downloaded from NCEI
  dataPredix-CLaned data
  PreprocessinR.R- R code

## DataCollection
From the website National Centers for Environmental Information(NCEI), we were able to obtain half hourly data for Gran Canaria Airport, Spain in the last 7 months. https://www.ncei.noaa.gov/data/global-hourly/access/2018/60030099999.csv. 

## Preprocessing in R
With the cleaning done in R, we identitfied several key parameters such as moving averages, rate of change. We then fit these data into the linear model in python to create our model for generalised linear regression. 

