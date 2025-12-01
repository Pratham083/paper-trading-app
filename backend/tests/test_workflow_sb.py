from seleniumbase import BaseCase
import uuid

class TestRegisterLogin(BaseCase):
  FRONTEND_URL = "http://localhost:5173"
  
  def test_register_login(self):
    test_email = f"sb_{uuid.uuid4().hex[:6]}@sb.com"
    test_username = f"sb_{uuid.uuid4().hex[:6]}"
    test_password = "12345678"
    self.open(self.FRONTEND_URL)

    self.type("input[placeholder='Username']", test_username)
    self.type("input[placeholder='Email']", test_email)
    self.type("input[placeholder='Password']", test_password)
    self.click("button:contains('Create Account')")
    self.assert_url(f"{self.FRONTEND_URL}/login")

    self.type("input[placeholder='Username or email']", test_email)
    self.type("input[placeholder='Password']", test_password)
    self.click("button[type='submit']:contains('Login')")
    self.assert_text("Welcome", "h2")


