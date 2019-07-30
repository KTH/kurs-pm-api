# Kurs-pm-api
## Api to store information about uploaded course memos to be used in course development and course info projects

This API is made within course information projekt(kip) to support micro services `kursutveckling-web`, `kurs-pm-web` and `kurs-pm-admin-web`

The two projects are [kurs-pm-web][web], a web server with express, and [kurs-pm-api][api], a RESTful API. 
The kurs-pm-web project use OpenID Connect and/or CAS as a mechanism for authorisation and authentication.

#### Where can I find all connected projects which depends on this API?

- [https://github.com/KTH/kurs-pm-web.git][api]
- [https://github.com/KTH/kurs-pm-admin-web.git][web]
- [https://github.com/KTH/kursutveckling-web.git][web]


#### Where can I find all connected projects which logically connected with this API?
- [https://github.com/KTH/kursinfo-admin-web.git][web]
- [https://github.com/KTH/kursinfo-web.git][web]

This API is independent and will not break other projects but it is important remember it is logically connected to the bigger picture of course information.

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

1. Create .env file and add keys there to show which applications can read or/and write to api, make apiKey unique and complex:

```
KURSPM_API_KEYS_0=?name=kursutveckling-web&apiKey=1234&scope=read
KURSPM_API_KEYS_1=?name=kurs-pm-web&apiKey=1234&scope=read
```

### How API data look like in configure the applications

Look at data definitions and paths in `swagger.json`.
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
#### What is `swagger-ui`?

The `swagger-ui` package is simply used to provide a basic UI for
testing the API. It is not directly required in the code, which
means running checks like `npm-check` will claim it is unused.
It cannot be stressed enough, **do not remove this package**!

#### What can I customize?

Follow the instructions for the files and folders below. For
any files and folders not listed, avoid editing them in a your
custom project.

- `server/models/`

  Anything in this folder can be edited to fit your project.
  You can safely remove the `sample.js` file and add your own
  mongoose-based schemas and models.

- `server/init/routing/sampleRoutes.js`

  This file contains routing config for the sample controller.
  You can either rename or remove this file. Other files in this
  folder should only be edited in the template project. The paths
  for the routes come from the `swagger.json` file.

- `server/controllers/sampleCtrl.js`

  This file contains the sample controller. You can either rename
  or remove this file. You can add your own controllers to this
  folder. Remember to add your custom controllers to the `index.js`
  file.

- `swagger.json`

  This file contains the API configuration and documentation.
  You should add your own paths to this file. See the [Swagger
  website][swagger] for documentation on the `swagger.json` format.

- `start.sh` and `stop.sh`

  Make sure to update the project name in these files.

- `package.json`

  Update the project name and add any dependencies you need.
  Excluding the testing scripts, avoid editing the scripts.

- `server/server.js`

  Add additional startup code to the init callback.

- `test/`

  As explained below, you can completely remove all tests if
  you like. If you want to use testing in your project, here's
  the recommended place to put your test files.

- `server/lib/`

  Here you can put custom code that does not fit in any other
  place. Though do not edit the `routing.js` file.

- `config/`

  Any and all configuration goes here. In particular you must
  edit the `commonSettings.js` file to match your project's
  proxy prefix path (i.e. `/api/node`). Other files you may
  want to edit are the environment specific files for the
  database connection config. Finally the `localSettings.js`
  file should never be checked into source control as it's
  used to contain sensitive information. You can also
  override other settings in this file.

- `.gitignore`

#### Common errors

When trying to run node-api as a standalone you might encounter the following error:
```
return binding.open(pathModule._makeLong(path), stringToFlags(flags), mode);
```
This is because the SSL information is incorrect in localSettings.js. Set ```useSsl: false``` to avoid this.


#### Testing

The template project uses a [sample setup][sample-test] for
tests using [tape][tape]. It is not required to use this test
harness in your projects. Simply remove the sample code and
any reference to it in your project's `package.json` file.

Keep in mind that you still need to provide a working npm
script for `npm test` for the build server. If you don't want
or need tests, a simple `echo "ok"` will suffice.

[api]: https://github.com/KTH/node-api
[web]: https://github.com/KTH/node-web
[tape]: https://github.com/substack/tape
[sample-test]: test/unit/specs/sampleCtrl-test.js
[swagger]: http://swagger.io/
