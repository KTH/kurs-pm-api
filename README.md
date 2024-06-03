# Welcome to Kurs-pm-api 👋

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg?cacheSeconds=2592000)
![Prerequisite](https://img.shields.io/badge/node-18-blue.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

## Api to Upload alternative course memo as PDF

This API is made within course information projekt(kip) to **support only one admin micro service** to administrate uploading of memo as PDF in `kurs-pm-admin-web`.

This api is used only by `kurs-pm-admin-web` to upload memo files in PDF format to a common blobstorage and saves information about file in database.
Important to know, **this api is not used by public pages**, instead use `kurs-pm-data-api`.

Same blobstorage and database is used by another web admin service `kurs-pm-data-admin-web` which is used to create/edit web based memos (not uploaded pdf)

As it was mentioned above, it is an alternative project to `kurs-pm-data-api` (preferably to use `kurs-pm-data-api` and `kurs-pm-data-admin-web`)

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

Secrets during local development are stored in a gitignored `.env` file (`env.in` can be used as template for your `.env` file). More details about environment variable setup and secrets can be found in [confluence](https://confluence.sys.kth.se/confluence/x/OYKBDQ).

## Prepara Database in Azure

1. Create database `kursinfo` and manually set Throughput: 400 (Shared). Name of database will be used in a connection string.
2. In this database create a collection `coursememos` where a shard key is `/courseCode`.
3. Change a connection string by adding name of database (`kursinfo`) after port slush `[port]/` and as a search query after `?` as `authSorce=kursinfo`:

`mongodb://kurs-pm-data-api-stage-mongodb-kthse:[password]==@kurs-pm-data-api-stage-mongodb-kthse.documents.azure.com:[port]`~~/?ssl=true~~`/kursinfo?ssl=true&authSource=kursinfo`

More information can be found in Confluence: [Om kursen: Databas och API, connection string](https://confluence.sys.kth.se/confluence/x/a4_KC)

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
  },

},
```

Vesion handles:

```json
{
  "previousFileList": {
    "type": "array",
    "items": "object",
    "description": "Array for object with previous memo files and its upload date",
    "properties": {
      "courseMemoFileName": {
        "type": "string",
        "description": "File name of a previous course memo"
      },
      "lastChangeDate": {
        "type": "string",
        "description": "Published date of a previous course memo"
      },
      "version": {
        "type": "string",
        "description": "Version number of course memo"
      }
    }
  }
}
```

#### What is `swagger-ui-dist`?

The `swagger-ui-dist` package is simply used to provide a basic UI for
testing the API. It is not directly required in the code, which
means running checks like `npm-check` will claim it is unused.
It cannot be stressed enough, **do not remove this package**!

#### What url to use locally?

```
localhost:3001/api/kurs-pm/_about
localhost:3001/api/kurs-pm/_monitor
localhost:3001/api/kurs-pm/swagger

```
