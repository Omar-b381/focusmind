import { create } from 'zustand'

interface EnergyState {
  currentEnergy: number
  hourlyEnergy: Record<number, number>
  
  setCurrentEnergy: (energy: number) => void
  setHourlyEnergy: (hour: number, level: number) => void
  initializeEnergyLogs: (logs: { hour: number; energyLevel: number }[]) => void
}

export const useEnergyStore = create<EnergyState>((set) => ({
  currentEnergy: 3,
  hourlyEnergy: {},

  setCurrentEnergy: (currentEnergy) => set({ currentEnergy }),
  
  setHourlyEnergy: (hour, level) => set((state) => ({
    hourlyEnergy: { ...state.hourlyEnergy, [hour]: level }
  })),
  
  initializeEnergyLogs: (logs) => set(() => {
    const hourly: Record<number, number> = {}
    logs.forEach(log => {
      hourly[log.hour] = log.energyLevel
    })
    return { hourlyEnergy: hourly }
  })
}))
