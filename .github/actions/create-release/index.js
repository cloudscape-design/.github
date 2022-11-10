import { writeFileSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import { getInput, setOutput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';
import conventionalChangelog from 'conventional-changelog';

async function run() {
  try {
    const { owner, repo } = context.repo;
    const version = getInput('version');

    const releaseName = getInput('release_name');
    const commitish = getInput('commitish');
    const bodyPath = getInput('body_path');
    let bodyFileContent = readFileSync(bodyPath, 'utf8');

    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    packageJson.version = version;
    writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

    conventionalChangelog({
      preset: 'conventionalcommits',
    }).pipe(process.stdout);

    const octokit = getOctokit(process.env.GITHUB_TOKEN);

    const createReleaseResponse = await octokit.rest.repos.createRelease({
      owner,
      repo,
      tag_name: version,
      name: releaseName,
      body: bodyFileContent,
      target_commitish: commitish,
    });

    const {
      data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl },
    } = createReleaseResponse;

    setOutput('id', releaseId);
    setOutput('html_url', htmlUrl);
    setOutput('upload_url', uploadUrl);
  } catch (error) {
    setFailed(error.message);
  }
}

run();
