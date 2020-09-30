# Kurs-pm-api

## Api to Upload alternative course memo as PDF 
To store information about uploaded course memos as PDF to be used in course memo as PDF project

This API is made within course information projekt(kip) to support only one micro service to administrate uploading of memo as PDF in `kurs-pm-admin-web`.
It is an alternative project to `kurs-pm-data-api` (preferably to use `kurs-pm-data-api` and `kurs-pm-data-admin-web`)

The two projects are [kurs-pm-admin-web][web], a web server with express, and [kurs-pm-api][api], a RESTful API.
The `kurs-pm-admin-web` project use OpenID Connect and/or CAS as a mechanism for authorisation and authentication.

#### Where can I find all connected projects which depends on this API?

- [https://github.com/KTH/kurs-pm-admin-web.git][web]

#### Where can I find all connected projects which logically connected with this API?

- [https://github.com/KTH/kursinfo-admin-web.git][web]

The service `kursinfo-admin-web`[Administrate about course] is used as an entrance to this service `kurs-pm-admin-web`.

This API is independent and will not break other projects but it is important remember it is logically connected to the bigger picture of course information.
It uses the same data models as `kurs-pm-data-api` but use different functions. It is separated in case `kurs-pm-admin-web` will be deprecated in favor of `kurs-pm-data-admin-web`.
Therefore it is connected only to admin part to save data and send it to the same database which is used by `kurs-pm-data-api` and `kurs-pm-api`.

#### How do I use this API project for a project of my own?

1. Create a new repository on Gita or Github.
2. Clone the newly created repository locally by using:

   ```bash
   git clone git@github.com:KTH/kurs-pm-api.git
   npm run start-dev
   or
   npm run start
   ```

   Make sure that your .git/config file is pointing to the new NEW_REPOSITORY_NAME

3. Navigate to the cloned project directory

### How to configure the applications

1. Create .env file and add keys there to show which applications can read or/and write to api, make apiKey unique and complex. 
This api read data from the same database as kurs-pm-data-api, f.e., in stage it is kurs-pm-data-api-stage-mongodb-kthse:

```
KURSPM_API_KEYS_0=?name=kurs-pm-admin-web&apiKey=[generate smth, f.e., 1234]&scope=write&scope=read
#Azure connection string to mongodb uri
KURS_PM_MONGODB_URI=mongodb://[db-name, f.e., kurs-pm-data-api-stage-mongodb-kthse]:[azure db password]@[db-name].documents.azure.com:[port]/kursinfo?ssl=true&authSource=kursinfo
SERVER_PORT=[server port is optional, mostly for local use, f.e., 3003]
USE_COSMOS_DB='true'
```

### How API data look like in configure the applications

Look at data definitions and paths in `swagger.json` and in [http://localhost:3003/api/kurs-pm/swagger][localhost swagger].
Here is one example

```
.
"ExistingData": {
  "properties": {
    "_id": {
      "type": "string",
      "description": "Unique identifier representing some specific data"
    },
    "memoName": {
      "type": "string",
      "description": "Kurstillfällen ska visas med kortnamn i första handalternativt kurstillfällets termin och kurstillfälleskod om kortnamn saknas. Därefter ska kurstillfällets startdatum och undervisningsspråk visas inom parentes.Formatet för visning av kurstillfälle är således:[kurstillfälle.kortnamn] alt. [termin-kurstillfälleskod] (Startdatum [kurstillfälle.startdatum], [kurstillfälle.undervisningsspråk])"
    },
    "courseCode": {
      "type": "string",
      "description": "Course code for which it is valid"
    },
    "commentChange": {
      "type": "string",
      "description": "Comments about changes which were introduced after publishing, f.e., why have teacher uploaded a new version, what changed there"
    },
    "isPublished": {
      "type": "string",
      "description": "If document is published or in draft version"
    },
    "publishedDate": {
      "type": "string",
      "description": "When document were published (first)?? time"
    },
    "pdfPMDate": {
      "type": "string",
      "description": "Time when pdf were stored in storage (f.e., Azure blobstorage)"
    },
    "changedDate": {
      "type": "string",
      "description": "When data were changed??"
    },
    "changedBy": {
      "type": "string",
      "description": "Unique KTH id of user who uploaded or changed this document data, f.e., u1iooii,"
    },
    "semester": {
      "type": "string",
      "description": "Course start term year (spring(VT)-1, autumn(HT)-2) , f.e. 20182 or 20181 (termin)"
    },
    "roundIdList": {
      "type": "string",
      "description": "List of round id:s for which memo is valid (kurstillfälle)"
    },
    "courseMemoFileName": {
      "type": "string",
      "description": "Uploaded courseMemo file"
    }
  },
  "ugKeys": {
    "type": "array",
    "description": "UG Keys for access to edit course memos???"
  },
  "changedAfterPublishedDate": {
    "type": "array",
    "description": "Date for changes made after published???"
  }
},
```

#### What is `swagger-ui-dist`?

The `swagger-ui-dist` package is simply used to provide a basic UI for
testing the API. It is not directly required in the code, which
means running checks like `npm-check` will claim it is unused.
It cannot be stressed enough, **do not remove this package**!

#### What url to use locally?

```
localhost:3003/api/kurs-pm/_about
localhost:3003/api/kurs-pm/_monitor
localhost:3003/api/kurs-pm/swagger

```
