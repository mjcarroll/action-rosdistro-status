import * as yaml from 'js-yaml';
import fs from 'fs'

interface Distribution {
    name: string;
    type: string;
    eol: boolean;
    frozen: boolean;
    type_frozen: boolean;
}

export function getDistributions(
    distro_path ='rosdistro/index-v4.yaml',
    status_path = 'rosdistro_status/status.yaml'): Map<string, Distribution> {

  const doc = yaml.safeLoad(fs.readFileSync(distro_path, 'utf-8'));
  const distributions = doc['distributions'];

  const status_doc = yaml.safeLoad(fs.readFileSync(status_path, 'utf-8'))
  const status = status_doc['distributions'];
  const buildfarm_status = status_doc['buildfarm'];

  const ret: Map<string, Distribution> = new Map();

  for (const label in distributions) {
    const distro = distributions[label];

    ret.set(label, {
        name: label,
        type: distro.distribution_type,
        eol: distro.distribution_status === 'end-of-life',
        frozen: status[label].frozen,
        type_frozen: buildfarm_status[distro.distribution_type].frozen
    });
  }

  return ret;
}

export function changedDistros(changedFiles: string[],
                               distros: Map<string, Distribution>) {
  const ret: Array<string> = new Array<string>();
  for (const file of changedFiles) {
      const path = file.split('/');
      if (distros.get(path[0]))
        ret.push(path[0]);
  }
  return ret;
}

export function checkStatus(
    distribution: string,
    distros: Map<string, Distribution>): [boolean, string]
{
  const info = distros.get(distribution);
  if (!info)
  {
    return [false, `Distribution: ${distribution} not found`];
  }
  else if (info.eol)
  {
    return [false, `Distribution: ${distribution} is end-of-life`];
  }
  else if (info.frozen)
  {
    return [false, `Distribution: ${distribution} is frozen`];
  }
  else if (info.type_frozen)
  {
    return [false, `Distribution type is frozen`];
  }

  return [true, ''];
}
