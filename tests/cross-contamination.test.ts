import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock contract calls
const mockContractCall = vi.fn()

// Mock contract state
let mockState = {
  productionLines: {},
  cleaningProtocols: {},
}

// Mock functions to simulate contract behavior
function registerProductionLine(lineId: number, name: string) {
  mockState.productionLines[lineId] = {
    name,
    "current-allergens": [],
    "last-cleaned": 12345, // Mock block height
  }
  return { success: true }
}

function registerCleaningProtocol(protocolId: number, allergen: number, description: string, requiredTime: number) {
  mockState.cleaningProtocols[protocolId] = {
    allergen,
    "protocol-description": description,
    "required-time": requiredTime,
  }
  return { success: true }
}

function recordProduction(lineId: number, ingredientId: number, allergens: number[]) {
  if (!mockState.productionLines[lineId]) {
    return { error: 1 }
  }
  
  mockState.productionLines[lineId]["current-allergens"] = allergens
  return { success: true }
}

function recordCleaning(lineId: number) {
  if (!mockState.productionLines[lineId]) {
    return { error: 1 }
  }
  
  mockState.productionLines[lineId]["current-allergens"] = []
  mockState.productionLines[lineId]["last-cleaned"] = 12345 // Mock block height
  return { success: true }
}

function isLineSafeForAllergen(lineId: number, allergen: number) {
  const line = mockState.productionLines[lineId]
  if (!line) return false
  
  return !line["current-allergens"].includes(allergen)
}

function getProductionLineDetails(lineId: number) {
  return mockState.productionLines[lineId] || null
}

// Setup mocks
vi.mock("clarity-functions", () => ({
  callReadOnlyFunction: mockContractCall,
}))

describe("Cross-contamination Contract", () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockState = {
      productionLines: {},
      cleaningProtocols: {},
    }
    
    mockContractCall.mockImplementation((contractName, functionName, args) => {
      if (functionName === "register-production-line") {
        const [lineId, name] = args
        return registerProductionLine(lineId, name)
      } else if (functionName === "register-cleaning-protocol") {
        const [protocolId, allergen, description, requiredTime] = args
        return registerCleaningProtocol(protocolId, allergen, description, requiredTime)
      } else if (functionName === "record-production") {
        const [lineId, ingredientId, allergens] = args
        return recordProduction(lineId, ingredientId, allergens)
      } else if (functionName === "record-cleaning") {
        const [lineId] = args
        return recordCleaning(lineId)
      } else if (functionName === "is-line-safe-for-allergen") {
        const [lineId, allergen] = args
        return isLineSafeForAllergen(lineId, allergen)
      } else if (functionName === "get-production-line-details") {
        const [lineId] = args
        return getProductionLineDetails(lineId)
      }
      return null
    })
  })
  
  it("should register a production line", () => {
    const lineId = 1
    const name = "Bakery Line 1"
    
    const result = registerProductionLine(lineId, name)
    expect(result).toEqual({ success: true })
    expect(mockState.productionLines[lineId]).toBeDefined()
    expect(mockState.productionLines[lineId].name).toBe(name)
  })
  
  it("should register a cleaning protocol", () => {
    const protocolId = 1
    const allergen = 2 // ALLERGEN_EGGS
    const description = "Full sanitization with allergen-specific cleaner"
    const requiredTime = 100
    
    const result = registerCleaningProtocol(protocolId, allergen, description, requiredTime)
    expect(result).toEqual({ success: true })
    expect(mockState.cleaningProtocols[protocolId]).toBeDefined()
    expect(mockState.cleaningProtocols[protocolId].allergen).toBe(allergen)
  })
  
  it("should record production on a line", () => {
    const lineId = 1
    const ingredientId = 5
    const allergens = [1, 2, 7] // MILK, EGGS, WHEAT
    
    registerProductionLine(lineId, "Bakery Line 1")
    const result = recordProduction(lineId, ingredientId, allergens)
    
    expect(result).toEqual({ success: true })
    expect(mockState.productionLines[lineId]["current-allergens"]).toEqual(allergens)
  })
  
  it("should not record production on a non-existent line", () => {
    const lineId = 1
    const ingredientId = 5
    const allergens = [1, 2, 7] // MILK, EGGS, WHEAT
    
    const result = recordProduction(lineId, ingredientId, allergens)
    expect(result).toEqual({ error: 1 })
  })
  
  it("should record cleaning of a production line", () => {
    const lineId = 1
    const allergens = [1, 2, 7] // MILK, EGGS, WHEAT
    
    registerProductionLine(lineId, "Bakery Line 1")
    recordProduction(lineId, 5, allergens)
    
    const result = recordCleaning(lineId)
    expect(result).toEqual({ success: true })
    expect(mockState.productionLines[lineId]["current-allergens"]).toEqual([])
  })
  
  it("should correctly identify if a line is safe for an allergen", () => {
    const lineId = 1
    const allergens = [1, 2] // MILK, EGGS
    
    registerProductionLine(lineId, "Bakery Line 1")
    recordProduction(lineId, 5, allergens)
    
    expect(isLineSafeForAllergen(lineId, 1)).toBe(false) // MILK - not safe
    expect(isLineSafeForAllergen(lineId, 7)).toBe(true) // WHEAT - safe
    
    recordCleaning(lineId)
    expect(isLineSafeForAllergen(lineId, 1)).toBe(true) // Now safe after cleaning
  })
  
  it("should return production line details", () => {
    const lineId = 1
    const name = "Bakery Line 1"
    
    registerProductionLine(lineId, name)
    const details = getProductionLineDetails(lineId)
    
    expect(details).toBeDefined()
    expect(details.name).toBe(name)
    expect(details["current-allergens"]).toEqual([])
  })
})
