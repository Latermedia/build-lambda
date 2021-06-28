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
    const version = process.env.VERSION;
    const templateOutputFileName = 'packaged.yaml';

    console.log(`\n\tService name: ${serviceName}\n\tBucket: ${bucket}\n\tVersion: ${version}\n\t`)

    console.log(await execShellCommand("sam build"));
    console.log(await execShellCommand(`sam package --template-file .aws-sam/build/template.yaml 
      --s3-bucket ${bucket} --s3-prefix ${serviceName}/${version} --output-template-file ${templateOutputFileName}`));

    core.setOutput('templateOutput', templateOutputFileName)
  } catch (error) {
    core.setFailed(error.message);
  }
})();
