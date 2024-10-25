const core = require('@actions/core');

function execShellCommand(cmd) {
  const exec = require('child_process').exec;
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        throw error
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

(async() => {
  try {
    const serviceName = core.getInput('name');
    const bucket = core.getInput('bucket');
    const containerized = core.getInput('use-container');
    const buildOptions = core.getInput('sam-build-options');
    const packageOptions = core.getInput('sam-package-options');
    const version = process.env.VERSION;
    const templateOutputFileName = 'packaged.yaml';

    console.log(`\n\tService name: ${serviceName}\n\tBucket: ${bucket}\n\tVersion: ${version}\n\t`)

    let buildCommand = "sam build";
    if (containerized) {
      buildCommand += " --use-container";
    }
    if (buildOptions) {
      buildCommand += " " + buildOptions;
    }

    console.log(await execShellCommand(buildCommand));

    let packageCommand = `sam package --template-file .aws-sam/build/template.yaml --s3-bucket ${bucket} --s3-prefix ${serviceName}/${version} --output-template-file ${templateOutputFileName}`;
    if (packageOptions) {
      packageCommand += " " + packageOptions;
    }
    console.log(await execShellCommand(packageCommand));

    core.setOutput('templateOutput', templateOutputFileName)
  } catch (error) {
    core.setFailed(error.message);
  }
})();
