;; Cross-contamination Contract
;; This contract prevents allergen cross-contamination

;; Map to track production lines and their allergen status
(define-map production-lines uint
  {
    name: (string-ascii 100),
    current-allergens: (list 10 uint),
    last-cleaned: uint
  }
)

;; Map to track cleaning protocols for allergens
(define-map cleaning-protocols uint
  {
    allergen: uint,
    protocol-description: (string-ascii 200),
    required-time: uint  ;; Time required for cleaning in blocks
  }
)

;; Public function to register a production line
(define-public (register-production-line (line-id uint) (name (string-ascii 100)))
  (ok (map-set production-lines line-id
    {
      name: name,
      current-allergens: (list),
      last-cleaned: block-height
    }
  ))
)

;; Public function to register a cleaning protocol
(define-public (register-cleaning-protocol
                (protocol-id uint)
                (allergen uint)
                (description (string-ascii 200))
                (required-time uint))
  (ok (map-set cleaning-protocols protocol-id
    {
      allergen: allergen,
      protocol-description: description,
      required-time: required-time
    }
  ))
)

;; Public function to record production on a line
(define-public (record-production (line-id uint) (ingredient-id uint) (allergens (list 10 uint)))
  (match (map-get? production-lines line-id)
    line-data (ok (map-set production-lines line-id
                  (merge line-data { current-allergens: allergens })))
    (err u1)  ;; Production line not found
  )
)

;; Public function to record cleaning of a production line
(define-public (record-cleaning (line-id uint))
  (match (map-get? production-lines line-id)
    line-data (ok (map-set production-lines line-id
                  (merge line-data {
                    current-allergens: (list),
                    last-cleaned: block-height
                  })))
    (err u1)  ;; Production line not found
  )
)

;; Read-only function to check if a production line is safe for an allergen
(define-read-only (is-line-safe-for-allergen (line-id uint) (allergen uint))
  (match (map-get? production-lines line-id)
    line-data (not (is-some (index-of (get current-allergens line-data) allergen)))
    false
  )
)

;; Read-only function to get production line details
(define-read-only (get-production-line-details (line-id uint))
  (map-get? production-lines line-id)
)
