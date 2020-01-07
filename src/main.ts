import * as core from '@actions/core'
import * as github from '@actions/github'
import {getDistributions, checkStatus, changedDistros} from './status';

async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token', {required: true});
    const checks = core.getInput('checks', {required: true}).split(',');

    const prNumber = getPrNumber()
    if (!prNumber) {
      console.log('Could not get pull request number from context, exiting');
      return;
    }

    const client = new github.GitHub(token)
    const changedFiles: string[] = await getChangedFiles(client, prNumber)

    const distros = getDistributions();
    const changed = changedDistros(changedFiles, distros);

    if (changed.length == 0){
      // This PR doesn't affect any distros
      return;
    }

    if (checks.includes('single_distro'))
    {
      if (changed.length > 1) {
        core.setFailed('PR must only change one disribution');
        return;
      }
    }

    const info = distros.get(changed[0]);

    if (!info) 
    {
      core.setFailed(`Could not find distro ${changed[0]}`)
      return;
    }

    if (checks.includes('eol'))
    {
      if (info.eol)
      {
        core.setFailed(`Distro ${changed[0]} is currently EOL`);
        return;
      }
    }

    if (checks.includes('distro_freeze'))
    {
      if (info.frozen)
      {
        core.setFailed(`Distro ${changed[0]} is currently frozen`);
        return;
      }
    }

    if (checks.includes('ros_freeze'))
    {
      if (info.type_frozen)
      {
        core.setFailed(`Type ${info.type} is currently frozen`)
      }
    }
  } catch (error) {
    core.error(error)
    core.setFailed(error.message)
  }
}

function getPrNumber(): number | undefined {
  const pullRequest = github.context.payload.pull_request
  if (!pullRequest) {
    return undefined
  }

  return pullRequest.number
}

async function getChangedFiles(
  client: github.GitHub,
  prNumber: number
): Promise<string[]> {
  const listFilesResponse = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber
  })

  const changedFiles = listFilesResponse.data.map(f => f.filename)

  core.debug('found changed files:')
  for (const file of changedFiles) {
    core.debug('  ' + file)
  }

  return changedFiles
}

run()
