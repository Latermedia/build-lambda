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
    const templateOutput = core.getInput('templateOutput');

    console.log(`\n\tService name: ${serviceName}\n\tBucket: ${bucket}\n\tVersion: ${version}\n\tTemplate Output: ${templateOutput}`)

    console.log(`SAM build`);
    console.log(await execShellCommand("sam build"));
    console.log(await execShellCommand(`sam package --template-file .aws-sam/build/template.yaml 
      --s3-bucket ${bucket} --s3-prefix ${serviceName}/${version} --output-template-file packaged.yaml`));

    console.log(await execShellCommand(`aws s3 cp packaged.yaml s3://${bucket}/${serviceName}/${version}/${templateOutput}`));
  } catch (error) {
    core.setFailed(error.message);
  }
})();
