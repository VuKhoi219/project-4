# 🛠️ Hướng Dẫn Phát Triển Backend Với Spring Boot + MySQL (XAMPP)

## 1. Giới Thiệu

Spring Boot là một framework mạnh mẽ giúc đơn giản hóa việc phát triển các ứng dụng Java, đặc biệt là các ứng dụng web và RESTful API. Tài liệu này hướng dẫn bạn cách thiết lập và phát triển một backend cơ bản sử dụng Spring Boot và MySQL được quản lý bởi **XAMPP**.

---

## 2. Cấu Trúc Dự Án

Cấu trúc thư mục tiêu chuẩn của một dự án Spring Boot:

```
project-root/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/demo/
│   │   │       ├── DemoApplication.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       └── model/
│   │   ├── resources/
│   │   │   ├── application.properties
│   │   │   └── static/
│   └── test/
├── pom.xml
└── README.md
```

| Thư mục / Tệp            | Mô tả                               |
| ------------------------ | ----------------------------------- |
| `DemoApplication.java`   | Lớp chính chạy ứng dụng Spring Boot |
| `controller/`            | Chứa các API endpoints              |
| `service/`               | Chứa logic nghiệp vụ                |
| `repository/`            | Chứa các lớp truy cập database      |
| `model/`                 | Chứa các entity hoặc DTO            |
| `application.properties` | Cấu hình ứng dụng (database, port)  |

---

## 3. Thiết Lập Môi Trường

### 🔧 Yêu Cầu

* Java JDK 17+
* Maven hoặc Gradle
* IDE: IntelliJ, Eclipse, hoặc VS Code
* XAMPP (chạy MySQL)
* phpMyAdmin hoặc MySQL Workbench (tuỳ chọn)

### ⚙️ Cài Đặt

#### Bước 1: Cài XAMPP và Tạo Database

* Tải XAMPP từ [https://www.apachefriends.org](https://www.apachefriends.org)
* Mở **XAMPP Control Panel**, khởi động `MySQL`
* Vào `http://localhost/phpmyadmin`, tạo database: `spring_boot_db`

#### Bước 2: Tạo Dự Án Spring Boot

* Truy cập [https://start.spring.io](https://start.spring.io)
* Chọn các dependencies:

    * Spring Web
    * Spring Data JPA
    * MySQL Driver
    * Lombok
* Tải về và mở bằng IDE

#### Bước 3: Cấu Hình `pom.xml`

```xml
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
  </dependency>
  <dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
  </dependency>
</dependencies>
```

#### Bước 4: Cấu Hình `application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/spring_boot_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
server.port=8080
```

> ⚠️ Ghi Chú:
>
> * `spring_boot_db` là tên database trong MySQL
> * Mậc định `username=root`, `password=""` (trống)
> * `spring.jpa.hibernate.ddl-auto=update` sẽ tự động tạo hoặc cập nhật bảng

---

## 4. ❤️ Ví Dụ API Đơn Giản

### ✍️ Tạo Entity: `User.java`

```java
package com.example.demo.model;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Data
@Entity
public class User {
  @Id
  private Long id;
  private String name;
  private String email;
}
```

### 🔹 Repository: `UserRepository.java`

```java
package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
```

### 📈 Service: `UserService.java`

```java
package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
  @Autowired
  private UserRepository userRepository;

  public List<User> getAllUsers() {
    return userRepository.findAll();
  }

  public User saveUser(User user) {
    return userRepository.save(user);
  }
}
```

### 👤 Controller: `UserController.java`

```java
package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
  @Autowired
  private UserService userService;

  @GetMapping
  public List<User> getAllUsers() {
    return userService.getAllUsers();
  }

  @PostMapping
  public User createUser(@RequestBody User user) {
    return userService.saveUser(user);
  }
}
```

---

## 5. 🚀 Chạy Ứng Dụng

* Đảm bảo MySQL trong XAMPP đang chạy
* Chạy file `DemoApplication.java` hoặc dùng lệnh:

```bash
mvn spring-boot:run
```

* Truy cập API:

    * `GET http://localhost:8080/api/users`
    * `POST http://localhost:8080/api/users`

#### JSON Body khi POST:

```json
{
  "id": 1,
  "name": "Nguyen Van A",
  "email": "a@example.com"
}
```

* Kiểm tra dữ liệu trong phpMyAdmin: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)

---

## 6. ✅ Một Số Lưu Ý

* ⛔ Bảo mật: Cân nhắc sử dụng Spring Security
* 🚨 Cổng: Đảm bảo MySQL chạy ở cổng 3306, thay đổi nếu cần trong `application.properties`
* 📝 Logging: Dùng SLF4J hoặc Logback
* 🔍 Test: JUnit + MockMvc
* 📂 Backup: Sao lưu database thường xuyên

---

## 7. 📖 Tài Nguyên Tham Khảo

* [Spring Boot Documentation](https://spring.io/projects/spring-boot)
* [Spring Initializr](https://start.spring.io)
* [Hướng dẫn REST API](https://restfulapi.net)
* [XAMPP Documentation](https://www.apachefriends.org)
