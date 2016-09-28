## node-api template project

In an attempt to simplify the process of starting up new
Node.js based projects, there exists two template projects
to use as a foundation.

The two projects are [node-web][web], a web server with
express, and [node-api][api], a RESTful API. Both of them
use OpenID Connect and/or CAS as a mechanism for
authorisation and authentication.

#### Where can I find the template projects?

- [https://github.com/KTH/node-api.git][api]
- [https://github.com/KTH/node-web.git][web]

It's important that we try to make changes that affect
the template projects in the template projects themselves.

#### How do I use this template project for a project of my own?

1. Create a new repository on Gita or Github.
2. Clone the newly created repository locally by using:

   ```bash
   git clone https://github.com/KTH/REPOSITORY
   or
   git clone https://gita.sys.kth.se/REPOSITORY.git
   ```

3. Navigate to the cloned project directory
4. Add node-web or node-api as the upstream repository to use:

   ```bash
   git remote add upstream https://github.com/KTH/node-[web/api].git
   ```

5. Fetch the latest changes/branches for the upstream
   repository (use your KTH login if prompted):

   ```bash
   git fetch upstream
   ```

6. Checkout the branch you want to use:

   ```bash
   git checkout master
   ```

7. Merge the changes from node-api into your cloned repository:

   ```bash
   git merge upstream/master
   ```

8. Solve merge conflicts and commit/push to your cloned repository.
9. Remove any sample code (e.g. `server/controllers/sampleCtrl.js`).

To keep your cloned repository up to date with the upstream
repository, just repeat steps 5-7 from above. Make sure to
commit and push your existing changes before you merge!

#### How do I set proxy path?

If your application is going to be proxied on
`www.kth.se/api/your-api-path`
make sure you set the following paths and properties.

Make sure you add the proxy prefix path in your paths in
`/config/commonSettings.js`

```
module.exports = {
  // The proxy prefix path if the application is proxied. E.g /api/node
  proxyPrefixPath: {
    uri: '/api/node'
  }
}
```

Set your basePath property in `swagger.json`:

```
{
  "swagger": "2.0",
  "info": {
  "title": "Node API",
    "description": "Template API project for Node.js",
    "version": "1.0.0"
  },
  "basePath": "/api/node/v1",
```

Please, remember to set path to match your application.

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
