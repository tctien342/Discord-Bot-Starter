/**
 * Powered by SaintNo github@saintno
 * Support script for minimal express project
 */
const fs = require('fs');
const args = process.argv.slice(2);
const lineReader = require('line-reader');

// Output
// console.log(args);

switch (args[0]) {
	case 'create': {
		switch (args[1]) {
			case 'module': {
				if (args.length === 4) {
					addModule(args[2], args[3]);
				} else {
					console.log('> Create module and bind it to app');
					console.log(
						'> Usage: create module <module name> <module url>',
					);
					console.log('> Example: create getUser users');
					console.log('	 > Route: localhost:3000/users');
					console.log('> Example: create userLogin users/login');
					console.log('	 > Route: localhost:3000/users/login');
					console.log(
						'<> Automatic create file getUser.ts and userLogin.ts in modules folder',
					);
				}
				break;
			}
			default: {
				console.log(
					'> Fast create component for express minimal project',
				);
				console.log('> Use like: let create <param>');
				console.log('> Current support: module');
			}
		}
		break;
	}
	default: {
		console.log('<> Support script for minimal express project');
		console.log('> Use like: node let <params>');
		console.log('> Currently support:');
		console.log('	> create: create component for app');
	}
}

/**
 * Create module in modules and bind it to app
 * @param {String} moduleName Name of new module
 * @param {String} moduleUrl Url to bind module with in route
 */
function addModule(moduleName, moduleUrl) {
	// Init values
	outPutNew = [];
	imported = false;
	existModuleName = false;
	existModuleUrl = false;
	moduleImportName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
	console.log('> Create module:', moduleName);
	console.log('> Module url:', moduleUrl);
	// Loop index
	lineReader.eachLine('src/modules/index.ts', (line, last) => {
		lineFirstWord = line.split(' ')[0];
		if (lineFirstWord !== 'import' && !imported) {
			outPutNew.push(
				'import ' + moduleImportName + ' from "./' + moduleName + '"',
			);
			outPutNew.push(line);
			imported = true;
		} else if (line.split(' ')[0] === '') {
			if (line.split("'")[1].replace('/', '') === moduleUrl) {
				existModuleUrl = true;
			}
			outPutNew.push(line);
		} else if (lineFirstWord === '};') {
			if (
				outPutNew[outPutNew.length - 1].charAt(
					outPutNew[outPutNew.length - 1].length - 1,
				) !== ','
			) {
				outPutNew[outPutNew.length - 1] =
					outPutNew[outPutNew.length - 1] + ',';
			}
			outPutNew.push('  "/' + moduleUrl + '": ' + moduleImportName);
			outPutNew.push(line);
		} else {
			if (
				lineFirstWord === 'import' &&
				line.split(' ')[1] === moduleImportName
			) {
				existModuleName = true;
			}
			outPutNew.push(line);
		}
		// Re-create index file
		if (last) {
			if (existModuleName) {
				console.log('<> Module name exist !!');
				return;
			}
			if (existModuleUrl) {
				console.log('<> Module url exist !!');
				return;
			}
			fs.truncate('src/modules/index.ts', 0, function() {
				var file = fs.createWriteStream('src/modules/index.ts');
				file.on('error', function(err) {
					console.log(err);
				});
				outPutNew.forEach(value => file.write(`${value}\r\n`));
				file.end();
				let dir = 'src/modules/' + moduleName;
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}
				fs.createReadStream('src/modules/__template__').pipe(
					fs.createWriteStream(
						'src/modules/' + moduleName + '/' + 'index.ts',
					),
				);
				fs.createReadStream('test/__template__').pipe(
					fs.createWriteStream('test/' + moduleName + '.test.ts'),
				);
			});
		}
	});
	return '';
}
