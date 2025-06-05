;; Food Business Verification Contract
;; This contract validates food businesses on the blockchain

(define-data-var admin principal tx-sender)

;; Data map to store verified food businesses
(define-map verified-businesses principal
  {
    business-name: (string-ascii 100),
    license-number: (string-ascii 50),
    verified: bool,
    verification-date: uint
  }
)

;; Public function to register a business
;; Only the business itself can register
(define-public (register-business (business-name (string-ascii 100)) (license-number (string-ascii 50)))
  (begin
    (asserts! (not (is-some (map-get? verified-businesses tx-sender))) (err u1)) ;; Error if already registered
    (ok (map-set verified-businesses tx-sender
      {
        business-name: business-name,
        license-number: license-number,
        verified: false,
        verification-date: u0
      }
    ))
  )
)

;; Admin function to verify a business
(define-public (verify-business (business principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u2)) ;; Only admin can verify
    (asserts! (is-some (map-get? verified-businesses business)) (err u3)) ;; Business must exist
    (match (map-get? verified-businesses business)
      business-data (ok (map-set verified-businesses business
        (merge business-data { verified: true, verification-date: block-height })))
      (err u3)
    )
  )
)

;; Public function to check if a business is verified
(define-read-only (is-business-verified (business principal))
  (match (map-get? verified-businesses business)
    business-data (get verified business-data)
    false
  )
)

;; Public function to get business details
(define-read-only (get-business-details (business principal))
  (map-get? verified-businesses business)
)

;; Admin function to transfer admin rights
(define-public (transfer-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u2)) ;; Only current admin can transfer
    (ok (var-set admin new-admin))
  )
)
