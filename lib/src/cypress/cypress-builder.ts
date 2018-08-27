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
  BuilderDescription,
  BuildEvent
} from '@angular-devkit/architect';
import { Observable, of } from 'rxjs';
import { concatMap, take, tap } from 'rxjs/operators';
import * as url from 'url';

export interface CypressBuilderOptions {
  devServerTarget?: string;
  project?: string;
  reporterPath?: string;
  baseUrl?: string;
  env?: object;
  host?: string;
  port?: number;
}

export abstract class CypressBuilder implements Builder<CypressBuilderOptions> {
  constructor(public context: BuilderContext) {}

  run(builderConfig: BuilderConfiguration<CypressBuilderOptions>): Observable<BuildEvent> {
    const options = {
      ...builderConfig.options,
      project: builderConfig.root
    };

    return of(null).pipe(
      concatMap(() => (options.devServerTarget ? this._startDevServer(options) : of(null))),
      concatMap(() => this.executeCypress(options)),
      take(1)
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
      overrides
    };
    const builderConfig = architect.getBuilderConfiguration<any>(targetSpec);
    let devServerDescription: BuilderDescription;
    let baseUrl: string;

    return architect.getBuilderDescription(builderConfig).pipe(
      tap(description => (devServerDescription = description as BuilderDescription)),
      concatMap(description => architect.validateBuilderOptions(builderConfig, description)),
      concatMap(() => {
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
            port: builderConfig.options.port.toString()
          });
        }

        // Save the computed baseUrl back so that Protractor can use it.
        options.baseUrl = baseUrl;

        return of(this.context.architect.getBuilder(devServerDescription, this.context));
      }),
      concatMap(builder => builder.run(builderConfig))
    );
  }

  abstract executeCypress(options: CypressBuilderOptions): Observable<BuildEvent>;
}

export default CypressBuilder;
