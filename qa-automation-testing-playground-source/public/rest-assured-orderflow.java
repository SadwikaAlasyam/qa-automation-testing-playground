import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.Test;

class OrderFlowApiTest {
  private final RequestSpecification spec = new RequestSpecBuilder()
      .setBaseUri(System.getProperty("baseUrl"))
      .setBasePath("/api")
      .addHeader("Accept", "application/json")
      .addHeader("X-API-Key", System.getProperty("apiKey", "qa-lab-key"))
      .build();

  @Test void validatesOrderContract() {
    given().spec(spec)
      .queryParam("region", "us")
    .when()
      .get("/advanced-lab")
    .then()
      .statusCode(200)
      .header("X-Correlation-ID", not(emptyString()))
      .body("order.id", equalTo("ADV-2048"))
      .body("order.total", equalTo(59.96f))
      .body("schemaVersion", equalTo("1.0"));
  }

  @Test void validatesExpiredToken() {
    given().spec(spec).queryParam("token", "expired")
    .when().get("/advanced-lab")
    .then().statusCode(401).body("code", equalTo("TOKEN_EXPIRED"));
  }
}
