import * as yaml from 'js-yaml'
import fs from 'fs'

interface Distribution {
  name: string
  type: string
  eol: boolean
  frozen: boolean
  typeFrozen: boolean
}

export function getDistributions(
  distroPath = 'rosdistro/index-v4.yaml',
  statusPath = 'rosdistro_status/status.yaml'
): Map<string, Distribution> {
  const distroDoc = yaml.safeLoad(fs.readFileSync(distroPath, 'utf-8'))
  const distributions = distroDoc['distributions']

  const statusDoc = yaml.safeLoad(fs.readFileSync(statusPath, 'utf-8'))
  const status = statusDoc['distributions']
  const buildfarmStatus = statusDoc['buildfarm']

  const ret: Map<string, Distribution> = new Map()

  for (const label in distributions) {
    const distro = distributions[label]

    ret.set(label, {
      name: label,
      type: distro.distribution_type,
      eol: distro.distribution_status === 'end-of-life',
      frozen: status[label].frozen,
      typeFrozen: buildfarmStatus[distro.distribution_type].frozen
    })
  }

  return ret
}

export function changedDistros(
  changedFiles: string[],
  distros: Map<string, Distribution>
): string[] {
  const ret: string[] = new Array<string>()
  for (const file of changedFiles) {
    const path = file.split('/')
    if (distros.get(path[0])) ret.push(path[0])
  }
  return ret
}

export function checkStatus(
  distribution: string,
  distros: Map<string, Distribution>
): [boolean, string] {
  const info = distros.get(distribution)
  if (!info) {
    return [false, `Distribution: ${distribution} not found`]
  } else if (info.eol) {
    return [false, `Distribution: ${distribution} is end-of-life`]
  } else if (info.frozen) {
    return [false, `Distribution: ${distribution} is frozen`]
  } else if (info.typeFrozen) {
    return [false, `Distribution type is frozen`]
  }

  return [true, '']
}
