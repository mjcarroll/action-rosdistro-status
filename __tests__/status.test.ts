import {getDistributions, checkStatus, changedDistros} from '../src/status'
import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'

const freezePath = './__tests__/rosdistro_status/status.yaml'
const freezePath_frozen = './__tests__/rosdistro_status/status_frozen.yaml'
const freezePath_frozen_type =
  './__tests__/rosdistro_status/status_frozen_type.yaml'

const distroPath = './__tests__/rosdistro/index-v4.yaml'

test('getDistributions', async () => {
  const distros = getDistributions(distroPath, freezePath)
  expect(distros.size).toBe(14)
})

test('checkStatus_nofreeze', async () => {
  const distros = getDistributions(distroPath, freezePath)

  expect(checkStatus('foobar', distros)[0]).toBeFalsy()

  expect(checkStatus('ardent', distros)[0]).toBeFalsy()
  expect(checkStatus('bouncy', distros)[0]).toBeFalsy()
  expect(checkStatus('crystal', distros)[0]).toBeTruthy()
  expect(checkStatus('dashing', distros)[0]).toBeTruthy()
  expect(checkStatus('eloquent', distros)[0]).toBeTruthy()
  expect(checkStatus('foxy', distros)[0]).toBeTruthy()

  expect(checkStatus('groovy', distros)[0]).toBeFalsy()
  expect(checkStatus('hydro', distros)[0]).toBeFalsy()
  expect(checkStatus('indigo', distros)[0]).toBeFalsy()
  expect(checkStatus('jade', distros)[0]).toBeFalsy()
  expect(checkStatus('kinetic', distros)[0]).toBeTruthy()
  expect(checkStatus('lunar', distros)[0]).toBeFalsy()
  expect(checkStatus('melodic', distros)[0]).toBeTruthy()
  expect(checkStatus('noetic', distros)[0]).toBeTruthy()
})

test('checkStatus_frozen', async () => {
  const distros = getDistributions(distroPath, freezePath_frozen)

  expect(checkStatus('crystal', distros)[0]).toBeTruthy()
  expect(checkStatus('dashing', distros)[0]).toBeFalsy()
  expect(checkStatus('eloquent', distros)[0]).toBeFalsy()
  expect(checkStatus('foxy', distros)[0]).toBeTruthy()

  expect(checkStatus('kinetic', distros)[0]).toBeTruthy()
  expect(checkStatus('melodic', distros)[0]).toBeFalsy()
  expect(checkStatus('noetic', distros)[0]).toBeTruthy()
})

test('checkStatus_frozen_type', async () => {
  const distros = getDistributions(distroPath, freezePath_frozen_type)

  expect(checkStatus('crystal', distros)[0]).toBeTruthy()
  expect(checkStatus('dashing', distros)[0]).toBeTruthy()
  expect(checkStatus('eloquent', distros)[0]).toBeTruthy()
  expect(checkStatus('foxy', distros)[0]).toBeTruthy()

  expect(checkStatus('kinetic', distros)[0]).toBeFalsy()
  expect(checkStatus('melodic', distros)[0]).toBeFalsy()
  expect(checkStatus('noetic', distros)[0]).toBeFalsy()
})

test('changedDistros', async () => {
  const distros = getDistributions(distroPath, freezePath_frozen_type)
  const vals = changedDistros(
    ['eloquent/distribution.yaml', 'dashing/distribution.yaml'],
    distros
  )
  expect(vals).toHaveLength(2)

  expect(changedDistros(['foobar'], distros)).toHaveLength(0)
})
