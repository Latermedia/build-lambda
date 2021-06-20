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
    const version = process.env.VERSION
    const gitmeta = core.getInput('gitmeta')
    const meta = core.getInput('meta')
    const metrics = core.getInput('metrics')

    console.log(`SAM build`);
    await execShellCommand("sam build")
    await execShellCommand(`sam package --template-file .aws-sam/build/template.yaml --s3-bucket ${bucket} --s3-prefix ${serviceName}/${version} --output-template-file packaged.yaml`)

    console.log("Copy to S3")

    await execShellCommand(`aws s3 cp packaged.yaml s3://${bucket}/${serviceName}/${version}/cf.yml`)

    if (gitmeta) {
      await execShellCommand(`aws s3 cp ${gitmeta} s3://${bucket}/${serviceName}/${version}/gitMeta`)
    }
    if (meta) {
      await execShellCommand(`aws s3 cp ${meta} s3://${bucket}/${serviceName}/${version}/meta.yml`);
    }

    if (metrics) {
      await execShellCommand(`aws s3 cp ${metrics} s3://${bucket}/${serviceName}/${version}/metrics.yml`)
    }

  } catch (error) {
    core.setFailed(error.message);
  }
})();
