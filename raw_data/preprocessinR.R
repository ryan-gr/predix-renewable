library(dplyr)
library(tidyr)
library(rlist)
library(stringr)

#function removes repeated values, and creates two new columns WND and TMP
cleanData <-function(dataFrame){
  dataFrame <-dataFrame%>% 
    filter(str_detect(REM, "MET"))%>%
    select(DATE,WND,TMP)%>%
    mutate(test1= strsplit(as.character(WND), ",",fixed = TRUE))%>%
    mutate(test2= strsplit(as.character(TMP), ",",fixed = TRUE))
  return(dataFrame)
}

#function to convert to numeric
converToNumeric <- function(dataFrame){
  lp<-length(dataFrame$DATE)
  
  ls1<-vector("double",lp)
  for (i in 1:lp)
  {
    dataf2<-dataFrame$test1[[i]][4]
    ls1[i]=as.numeric(dataf2)
  }
  
  
  dataFrame$wind<-ls1
  
  dataFrame<-dataFrame%>%filter(wind>0 & wind<9999)
  
  
  lp<-length(dataFrame$DATE)
  
  ls2<-vector("double",lp)
  lsTargetVar<-vector("double",lp)
  for (i in 1:lp)
  {
    dataf2<-dataFrame$test2[[i]][1]
    ls2[i]=as.numeric(dataf2)
    
  }
  dataFrame$temp<-ls2
  return(dataFrame)
}
formatDate <- function(dataFrame){
  dataFrame<-dataFrame%>%
    select(DATE,wind,temp)%>%
    mutate(hour=format(as.POSIXct(DATE, format="%Y-%m-%dT%H:%M:%S"), format="%H"))
  dataFrame$hour<-as.numeric(dataFrame$hour)
}

createDerivedValues<- function(dataFrame){
  for( id in 9:lp){
    print(id)
    varreq=(which(dataFrame$DATE == dataFrame$DATE[id]))
    #calc value for roc from last
    lsROC0.5[id]=(dataFrame$wind[varreq]-dataFrame$wind[varreq-1])
    lsROC2[id]=(dataFrame$wind[varreq]-dataFrame$wind[varreq-4])/4
    lsROC4[id]=(dataFrame$wind[varreq]-dataFrame$wind[varreq-8])/8
    lsMA2[id]=(dataFrame$wind[varreq]+
                 dataFrame$wind[varreq-1]+
                 dataFrame$wind[varreq-2]+
                 dataFrame$wind[varreq-3])/4
    lsMA4[id]=(dataFrame$wind[varreq]+
                 dataFrame$wind[varreq-1]+
                 dataFrame$wind[varreq-2]+
                 dataFrame$wind[varreq-3]+
                 dataFrame$wind[varreq-4]+
                 dataFrame$wind[varreq-5]+
                 dataFrame$wind[varreq-6]+
                 dataFrame$wind[varreq-7])/8
    
  }
}


combineDerived_Var<-function(dataFrame){
  dataFrame<-dataFrame%>% mutate(targVar=lsTargetVar)%>% 
    mutate(RateOfChange0.5=lsROC0.5)%>%
    mutate(RateOfChange2=lsROC2)%>%
    mutate(RateOfChange4=lsROC4)%>%
    mutate(MovingAverage2=lsMA2)%>%
    mutate(MovingAverage4=lsMA4)
  
}

rawData<-read.csv(file = "C:/Users/hojin/Desktop/Cards/60030099999.csv", header=TRUE, sep=",")

dataf1<-cleanData(rawData)
dataf2<-converToNumeric(dataf1)
dataf3<-formatDatedata(f2)
createDerivedValues(dataf3)
dataf4<-combineDerived_Var(dataf3)




write.csv(dataf4, file = "DataPredix.csv")

