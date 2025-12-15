# Java Backend Code for View Details & Delete Operations

## 1. **Update Quotation Repository**

```java
package com.nebulytix.repositories;

import com.nebulytix.models.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    Quotation findByQuotationNumber(String quotationNumber);

    // Get all quotations ordered by date
    List<Quotation> findAllByOrderByQuotationDateDesc();
}
```

---

## 2. **Update Controller with GET and DELETE endpoints**

```java
package com.nebulytix.controllers;

import com.nebulytix.models.Quotation;
import com.nebulytix.repositories.QuotationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/quotations")
@CrossOrigin(origins = "http://localhost:5173") // Vite dev server port
public class QuotationController {

    @Autowired
    private QuotationRepository quotationRepository;

    // Save new quotation
    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> saveQuotation(@RequestBody Map<String, Object> quotationData) {
        try {
            Quotation quotation = new Quotation();

            // Set basic fields
            quotation.setQuotationNumber((String) quotationData.get("quotationNumber"));
            quotation.setQuotationDate((String) quotationData.get("quotationDate"));

            // Company Details
            quotation.setCompanyName((String) quotationData.get("companyName"));
            quotation.setCompanyAddress((String) quotationData.get("companyAddress"));
            quotation.setCompanyEmail((String) quotationData.get("companyEmail"));
            quotation.setCompanyPhone((String) quotationData.get("companyPhone"));

            // Client Details
            quotation.setClientName((String) quotationData.get("clientName"));
            quotation.setClientEmail((String) quotationData.get("clientEmail"));
            quotation.setClientPhone((String) quotationData.get("clientPhone"));
            quotation.setProjectName((String) quotationData.get("projectName"));

            // Project Information
            quotation.setProjectCategory((String) quotationData.get("projectCategory"));
            quotation.setProjectType((String) quotationData.get("projectType"));

            // Financial Details
            quotation.setGstPercent(((Number) quotationData.get("gstPercent")).doubleValue());
            quotation.setSubtotal(((Number) quotationData.get("subtotal")).doubleValue());
            quotation.setGstAmount(((Number) quotationData.get("gstAmount")).doubleValue());
            quotation.setTotalAmount(((Number) quotationData.get("totalAmount")).doubleValue());
            quotation.setPaymentTerms((String) quotationData.get("paymentTerms"));
            quotation.setStatus((String) quotationData.get("status"));

            // Convert lists to JSON strings
            ObjectMapper mapper = new ObjectMapper();
            quotation.setDevelopment(mapper.writeValueAsString(quotationData.get("development")));
            quotation.setUsers(mapper.writeValueAsString(quotationData.get("users")));
            quotation.setAdditionalCosts(mapper.writeValueAsString(quotationData.get("additionalCosts")));

            // Save to database
            Quotation savedQuotation = quotationRepository.save(quotation);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Quotation saved successfully",
                "quotationId", savedQuotation.getId(),
                "quotationNumber", savedQuotation.getQuotationNumber()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", "Error saving quotation: " + e.getMessage()
            ));
        }
    }

    // Get all quotations
    @GetMapping("/all")
    public ResponseEntity<List<Quotation>> getAllQuotations() {
        try {
            List<Quotation> quotations = quotationRepository.findAllByOrderByQuotationDateDesc();
            return ResponseEntity.ok(quotations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get single quotation by ID
    @GetMapping("/{id}")
    public ResponseEntity<Quotation> getQuotation(@PathVariable Long id) {
        try {
            Optional<Quotation> quotation = quotationRepository.findById(id);
            return quotation.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete quotation
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteQuotation(@PathVariable Long id) {
        try {
            if (quotationRepository.existsById(id)) {
                quotationRepository.deleteById(id);
                return ResponseEntity.ok(Map.of(
                    "message", "Quotation deleted successfully"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "Quotation not found"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Error deleting quotation: " + e.getMessage()
            ));
        }
    }

    // Update quotation
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateQuotation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> quotationData) {
        try {
            Optional<Quotation> existingQuotation = quotationRepository.findById(id);

            if (!existingQuotation.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "message", "Quotation not found"
                ));
            }

            Quotation quotation = existingQuotation.get();

            // Update fields
            quotation.setCompanyName((String) quotationData.get("companyName"));
            quotation.setCompanyAddress((String) quotationData.get("companyAddress"));
            quotation.setCompanyEmail((String) quotationData.get("companyEmail"));
            quotation.setCompanyPhone((String) quotationData.get("companyPhone"));

            quotation.setClientName((String) quotationData.get("clientName"));
            quotation.setClientEmail((String) quotationData.get("clientEmail"));
            quotation.setClientPhone((String) quotationData.get("clientPhone"));
            quotation.setProjectName((String) quotationData.get("projectName"));

            quotation.setProjectCategory((String) quotationData.get("projectCategory"));
            quotation.setProjectType((String) quotationData.get("projectType"));

            quotation.setGstPercent(((Number) quotationData.get("gstPercent")).doubleValue());
            quotation.setSubtotal(((Number) quotationData.get("subtotal")).doubleValue());
            quotation.setGstAmount(((Number) quotationData.get("gstAmount")).doubleValue());
            quotation.setTotalAmount(((Number) quotationData.get("totalAmount")).doubleValue());
            quotation.setPaymentTerms((String) quotationData.get("paymentTerms"));

            ObjectMapper mapper = new ObjectMapper();
            quotation.setDevelopment(mapper.writeValueAsString(quotationData.get("development")));
            quotation.setUsers(mapper.writeValueAsString(quotationData.get("users")));
            quotation.setAdditionalCosts(mapper.writeValueAsString(quotationData.get("additionalCosts")));

            Quotation updatedQuotation = quotationRepository.save(quotation);

            return ResponseEntity.ok(Map.of(
                "message", "Quotation updated successfully",
                "quotationId", updatedQuotation.getId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", "Error updating quotation: " + e.getMessage()
            ));
        }
    }
}
```

---

## 3. **Add Service Layer (Optional but Recommended)**

```java
package com.nebulytix.services;

import com.nebulytix.models.Quotation;
import com.nebulytix.repositories.QuotationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class QuotationService {

    @Autowired
    private QuotationRepository quotationRepository;

    public Quotation saveQuotation(Quotation quotation) {
        return quotationRepository.save(quotation);
    }

    public List<Quotation> getAllQuotations() {
        return quotationRepository.findAllByOrderByQuotationDateDesc();
    }

    public Optional<Quotation> getQuotationById(Long id) {
        return quotationRepository.findById(id);
    }

    public void deleteQuotation(Long id) {
        quotationRepository.deleteById(id);
    }

    public Quotation updateQuotation(Long id, Quotation quotation) {
        quotation.setId(id);
        return quotationRepository.save(quotation);
    }
}
```

---

## 4. **API Endpoints Summary**

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| POST   | `/api/quotations/save` | Save new quotation   |
| GET    | `/api/quotations/all`  | Get all quotations   |
| GET    | `/api/quotations/{id}` | Get single quotation |
| PUT    | `/api/quotations/{id}` | Update quotation     |
| DELETE | `/api/quotations/{id}` | Delete quotation     |

---

## 5. **Testing with cURL**

```bash
# Get all quotations
curl http://localhost:7070/api/quotations/all

# Get specific quotation
curl http://localhost:7070/api/quotations/1

# Delete quotation
curl -X DELETE http://localhost:7070/api/quotations/1

# Update quotation (PUT request with JSON body)
curl -X PUT http://localhost:7070/api/quotations/1 \
  -H "Content-Type: application/json" \
  -d '{"clientName":"New Name","clientEmail":"email@example.com"...}'
```

---

## 6. **Database Configuration (application.properties)**

```properties
server.port=7070
spring.application.name=quotation-api

spring.datasource.url=jdbc:mysql://localhost:3306/quotation_db
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

spring.web.cors.allowed-origins=http://localhost:5173
spring.web.cors.allow-credentials=true
```

---

## 7. **Postman Testing Tips**

1. **Save Quotation** - POST request with JSON body
2. **Get All** - GET request to `/api/quotations/all`
3. **View Details** - GET request to `/api/quotations/{id}`
4. **Delete** - DELETE request to `/api/quotations/{id}`

---

## How the React-Java Integration Works

1. **View Details Button** - Opens modal with table of all quotations from database
2. **View Action** - Fetches full details from `/api/quotations/{id}` endpoint
3. **Delete Action** - Sends DELETE request to remove from database
4. **Auto-refresh** - List updates immediately after delete
