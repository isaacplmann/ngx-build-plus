# ngx-cypress-builder

Run Cypress from the Angular CLI for your E2E tests.

## Credits

Big thanks to [Manfred Steyer](https://twitter.com/ManfredSteyer) for showing this was possible with [ngx-build-plus](https://github.com/manfredsteyer/ngx-build-plus)

## Tested with CLI 6.1.x

This package has been created and tested with Angular CLI 6.1.x. If the CLI's underlying API changes in future, I'll provide an respective update for this version too until the CLI has build-in features for the covered use cases.

## Example

https://github.com/isaacplmann/ngx-cypress-builder/sample

## Usage

The next steps guides you trough getting started with `ngx-cypress-builder`. The result of this description can be found in the [repository's](https://github.com/isaacplmann/ngx-cypress-builder/sample) `sample` directory.

1. Create a new Angular CLI based project:

   ```
   ng new my-sample-app
   ```

2. Install cypress and ngx-cypress-builder:

   ```
   npm i -D cypress ngx-cypress-builder
   ```

3. Open your `angular.json` and tell the CLI to use `ngx-cypress-builder` instead of protractor:

   ```
     [...]
    "my-sample-app-e2e": {
      "root": "cypress/",
      "projectType": "application",
      "architect": {
        "e2e": {
          "builder": "ngx-cypress-builder:cypress",
          "options": {
            "devServerTarget": "my-sample-app:serve"
          },
          "configurations": {
            "production": {
              "devServerTarget": "my-sample-app:serve:production"
            }
          }
        }
      }
    }
     [...]
   ```

4. Create a default Cypress setup

   ```
   npx cypress open
   ```

5. Close the Cypress application

6. Run the sample Cypress tests through the angular cli

   ```bash
   npm run e2e
   # or
   ng e2e
   ```

This will serve your application, run the Cypress tests and exit.

## devServerTarget in angular.json

If you do not specify a `devServerTarget` in the `angular.json` file, the cli will skip that step and just run Cypress.
