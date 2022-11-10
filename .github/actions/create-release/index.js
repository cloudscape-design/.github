import { getInput, setOutput, setFailed } from "@actions/core";
const github = require('@actions/github');
const fs = require("fs");

async function run() {
  try {
    const { owner, repo } = github.context.repo;
    const tagName = getInput("tag_name", { required: true });

    const releaseName = getInput("release_name", { required: false });
    const commitish =
      getInput("commitish", { required: false });

    const bodyPath = getInput("body_path");

    let bodyFileContent = fs.readFileSync(bodyPath, { encoding: "utf8" });

    const octokit = github.getOctokit(process.env.GITHUB_TOKEN)

    const createReleaseResponse = await octokit.repos.createRelease({
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

    setOutput("id", releaseId);
    setOutput("html_url", htmlUrl);
    setOutput("upload_url", uploadUrl);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
