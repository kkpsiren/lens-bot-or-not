from dotenv import load_dotenv

load_dotenv()

import pandas as pd
import pymongo
import os

# connect to MongoDB
client = pymongo.MongoClient(os.getenv("MONGO_ENDPOINT"))
db = client[os.getenv("MONGO_DB")]
collection = db[os.getenv("MONGO_COLLECTION")]

# define a DataFrame
df = pd.read_hdf("data.hdf", key="df")

# convert the DataFrame to a list of dictionaries
doc_list = df.to_dict(orient="records")

# insert the documents into the collection
result = collection.insert_many(doc_list)

# print the inserted IDs
print(len(result.inserted_ids))
