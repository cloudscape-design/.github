const core = require("@actions/core");
const { GitHub, context } = require("@actions/github");
const fs = require("fs");

async function run() {
  try {
    const github = new GitHub(process.env.GITHUB_TOKEN);
    const { owner, repo } = context.repo;
    const tagName = core.getInput("tag_name", { required: true });

    const releaseName = core.getInput("release_name", { required: false });
    const commitish =
      core.getInput("commitish", { required: false }) || context.sha;

    const bodyPath = core.getInput("body_path");

    let bodyFileContent = fs.readFileSync(bodyPath, { encoding: "utf8" });

    const createReleaseResponse = await github.repos.createRelease({
      owner,
      repo,
      tag_name: tagName,
      name: releaseName,
      body: bodyFileContent,
      target_commitish: commitish,
    });

    const {
      data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl },
    } = createReleaseResponse;

    core.setOutput("id", releaseId);
    core.setOutput("html_url", htmlUrl);
    core.setOutput("upload_url", uploadUrl);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
