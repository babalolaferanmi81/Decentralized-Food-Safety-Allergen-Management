import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock contract calls
const mockContractCall = vi.fn()

// Mock contract state
let mockState = {
  admin: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  verifiedBusinesses: {},
}

// Mock functions to simulate contract behavior
function registerBusiness(sender: string, businessName: string, licenseNumber: string) {
  if (mockState.verifiedBusinesses[sender]) {
    return { error: 1 }
  }
  
  mockState.verifiedBusinesses[sender] = {
    "business-name": businessName,
    "license-number": licenseNumber,
    verified: false,
    "verification-date": 0,
  }
  
  return { success: true }
}

function verifyBusiness(sender: string, business: string) {
  if (sender !== mockState.admin) {
    return { error: 2 }
  }
  
  if (!mockState.verifiedBusinesses[business]) {
    return { error: 3 }
  }
  
  mockState.verifiedBusinesses[business].verified = true
  mockState.verifiedBusinesses[business]["verification-date"] = 12345 // Mock block height
  
  return { success: true }
}

function isBusinessVerified(business: string) {
  return mockState.verifiedBusinesses[business]?.verified || false
}

function getBusinessDetails(business: string) {
  return mockState.verifiedBusinesses[business] || null
}

// Setup mocks
vi.mock("clarity-functions", () => ({
  callReadOnlyFunction: mockContractCall,
}))

describe("Food Business Verification Contract", () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockState = {
      admin: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
      verifiedBusinesses: {},
    }
    
    mockContractCall.mockImplementation((contractName, functionName, args) => {
      if (functionName === "register-business") {
        const [sender, businessName, licenseNumber] = args
        return registerBusiness(sender, businessName, licenseNumber)
      } else if (functionName === "verify-business") {
        const [sender, business] = args
        return verifyBusiness(sender, business)
      } else if (functionName === "is-business-verified") {
        const [business] = args
        return isBusinessVerified(business)
      } else if (functionName === "get-business-details") {
        const [business] = args
        return getBusinessDetails(business)
      }
      return null
    })
  })
  
  it("should register a new business", () => {
    const sender = "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"
    const result = registerBusiness(sender, "Test Restaurant", "LICENSE123")
    expect(result).toEqual({ success: true })
    expect(mockState.verifiedBusinesses[sender]).toBeDefined()
    expect(mockState.verifiedBusinesses[sender]["business-name"]).toBe("Test Restaurant")
  })
  
  it("should not register a business twice", () => {
    const sender = "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"
    registerBusiness(sender, "Test Restaurant", "LICENSE123")
    const result = registerBusiness(sender, "Test Restaurant 2", "LICENSE456")
    expect(result).toEqual({ error: 1 })
  })
  
  it("should verify a business when called by admin", () => {
    const business = "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"
    registerBusiness(business, "Test Restaurant", "LICENSE123")
    const result = verifyBusiness(mockState.admin, business)
    expect(result).toEqual({ success: true })
    expect(mockState.verifiedBusinesses[business].verified).toBe(true)
  })
  
  it("should not verify a business when called by non-admin", () => {
    const business = "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"
    const nonAdmin = "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE"
    registerBusiness(business, "Test Restaurant", "LICENSE123")
    const result = verifyBusiness(nonAdmin, business)
    expect(result).toEqual({ error: 2 })
    expect(mockState.verifiedBusinesses[business].verified).toBe(false)
  })
  
  it("should correctly report if a business is verified", () => {
    const business = "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"
    registerBusiness(business, "Test Restaurant", "LICENSE123")
    expect(isBusinessVerified(business)).toBe(false)
    
    verifyBusiness(mockState.admin, business)
    expect(isBusinessVerified(business)).toBe(true)
  })
  
  it("should return business details", () => {
    const business = "SP3GWX3NE58KXHESRYE4DYQ1S31PQJTCRXB3PE9SB"
    registerBusiness(business, "Test Restaurant", "LICENSE123")
    verifyBusiness(mockState.admin, business)
    
    const details = getBusinessDetails(business)
    expect(details).toBeDefined()
    expect(details["business-name"]).toBe("Test Restaurant")
    expect(details["license-number"]).toBe("LICENSE123")
    expect(details.verified).toBe(true)
  })
})
