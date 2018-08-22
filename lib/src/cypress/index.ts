/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  Builder,
  BuilderConfiguration,
  BuilderContext,
  BuildEvent,
} from '@angular-devkit/architect';
import { from, Observable, of } from 'rxjs';
import { concatMap, concatMapTo, map, take, tap } from 'rxjs/operators';
import * as url from 'url';

export interface CypressBuilderOptions {
  devServerTarget?: string;
  baseUrl?: string;
  host?: string;
  port?: number;
}

export class CypressBuilder implements Builder<CypressBuilderOptions> {
  constructor(public context: BuilderContext) {}

  run(builderConfig: BuilderConfiguration<CypressBuilderOptions>): Observable<BuildEvent> {
    const options = builderConfig.options;

    return (options.devServerTarget ? this._startDevServer(options) : of(null)).pipe(
      concatMapTo(this._runCypress(options)),
      take(1),
    );
  }

  // Note: this method mutates the options argument.
  private _startDevServer(options: CypressBuilderOptions) {
    const architect = this.context.architect;
    const [project, targetName, configuration] = (options.devServerTarget as string).split(':');
    // Override browser build watch setting.
    const overrides = { watch: false, host: options.host, port: options.port };
    const targetSpec = {
      project,
      target: targetName,
      configuration,
      overrides,
    };
    const builderConfig = architect.getBuilderConfiguration<any>(targetSpec);
    let baseUrl: string;

    return architect.getBuilderDescription(builderConfig).pipe(
      tap(devServerDescription =>
        architect.validateBuilderOptions(builderConfig, devServerDescription),
      ),
      map(devServerDescription => {
        // Compute baseUrl from devServerOptions.
        if (options.devServerTarget && builderConfig.options.publicHost) {
          let publicHost = builderConfig.options.publicHost;
          if (!/^\w+:\/\//.test(publicHost)) {
            publicHost = `${builderConfig.options.ssl ? 'https' : 'http'}://${publicHost}`;
          }
          const clientUrl = url.parse(publicHost);
          baseUrl = url.format(clientUrl);
        } else if (options.devServerTarget) {
          baseUrl = url.format({
            protocol: builderConfig.options.ssl ? 'https' : 'http',
            hostname: options.host,
            port: builderConfig.options.port.toString(),
          });
        }

        // Save the computed baseUrl back so that Protractor can use it.
        options.baseUrl = baseUrl;

        return this.context.architect.getBuilder(devServerDescription, this.context);
      }),
      concatMap(builder => builder.run(builderConfig)),
    );
  }

  private _runCypress(options: CypressBuilderOptions): Observable<BuildEvent> {
    const additionalCypressConfig = {
      config: {
        baseUrl: options.baseUrl,
      },
    };
    const cypress = require('cypress');

    return from(cypress.run(additionalCypressConfig)).pipe(
      map((result: any) => ({ success: result.totalFailed === 0 })),
    );
  }
}

export default CypressBuilder;
