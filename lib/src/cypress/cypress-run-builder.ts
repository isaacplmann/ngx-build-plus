/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { BuilderContext, BuildEvent } from '@angular-devkit/architect';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import CypressBuilder, { CypressBuilderOptions } from './cypress-builder';

export class CypressRunBuilder extends CypressBuilder {
  constructor(public context: BuilderContext) {
    super(context);
  }

  executeCypress(options: CypressBuilderOptions): Observable<BuildEvent> {
    return this._runCypress(options);
  }

  private _runCypress(options: CypressBuilderOptions): Observable<BuildEvent> {
    const additionalCypressConfig = {
      config: {
        baseUrl: options.baseUrl
      },
      ...(options.project ? { project: options.project } : {}),
      ...(options.reporterPath ? { reporter: options.reporterPath } : {}),
      ...(options.env ? { env: options.env } : {})
    };
    const cypress = require('cypress');

    return from(cypress.run(additionalCypressConfig)).pipe(
      map((result: any) => ({ success: result.totalFailed === 0 }))
    );
  }
}

export default CypressRunBuilder;
