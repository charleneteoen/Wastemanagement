// pages/api/run-simulation.ts

import type { NextApiRequest, NextApiResponse } from 'next'
import { spawn } from 'child_process'
import path from 'path'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const inputData = req.body

  const simulationScript = path.join(process.cwd(), 'scripts/simulation.js')
  const simulationProcess = spawn('node', [simulationScript, JSON.stringify(inputData)])

  let output = ''
  simulationProcess.stdout.on('data', (data) => {
    output += data.toString()
  })

  simulationProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  simulationProcess.on('close', (code) => {
    if (code === 0) {
      try {
        const result = JSON.parse(output)
        res.status(200).json(result)
      } catch (err) {
        res.status(500).json({ error: 'Invalid JSON returned from simulation.js' })
      }
    } else {
      res.status(500).json({ error: 'Simulation process failed' })
    }
  })
}
