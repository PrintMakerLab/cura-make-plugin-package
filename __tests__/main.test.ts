import * as process from 'process';
import * as cp from 'child_process';
import * as path from 'path';
<<<<<<< HEAD
=======
import { expect, test } from '@jest/globals';
>>>>>>> 985574569b77f9f2b6c3fde7081f39ae72bef153

//TODO skip tests for now and made them asap
// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
	process.env['SOURCE_FOLDER'] = '../Cura-TestPlugin';
	const np = process.execPath;
	const ip = path.join(__dirname, '..', 'lib', 'main.js');
	const options: cp.ExecFileSyncOptions = {
		env: process.env,
	};
	//console.log(cp.execFileSync(np, [ip], options).toString())
	const result = 0;
	console.log(result);
});
