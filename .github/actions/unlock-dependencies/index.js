#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const fs = require("fs");
const path = require("path");

/**
 * Remove specific @cloudscape-design/* packages where we should always use the latest minor release.
 */
[
  path.resolve(process.env.GITHUB_WORKSPACE, "package-lock.json"),
  path.resolve(
    process.env.GITHUB_WORKSPACE,
    ".github",
    "workflows",
    "bundle-size",
    "package-lock.json"
  ),
].forEach((filename) => unlock(filename));

function unlock(filename) {
  try {
    const packageLock = JSON.parse(fs.readFileSync(filename));

    Object.keys(packageLock.packages).forEach((dependencyName) => {
      removeDependencies(dependencyName, packageLock.packages);
    });

    Object.keys(packageLock.dependencies).forEach((dependencyName) => {
      removeDependencies(dependencyName, packageLock.dependencies);
    });

    fs.writeFileSync(filename, JSON.stringify(packageLock, null, 2) + "\n");

    console.log(
      "Removed @cloudscape-design/ dependencies from package-lock file"
    );
  } catch (error) {
    console.warn(
      `Can't unlock dependencies for ${filename}: `,
      error?.message ?? "unknown reason"
    );
  }
}

function removeDependencies(dependencyName, packages) {
  if (dependencyName.includes("@cloudscape-design/")) {
    delete packages[dependencyName];
  }
}
