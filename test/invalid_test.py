import unittest
import json
import time
from selenium import webdriver 
from selenium.webdriver.common.keys import Keys 
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains 

class InvalidTest(unittest.TestCase): 

    def setUp(self):
        #chrome produces flaky test results 
        #self.driver = webdriver.Chrome("chromedriver.exe")
        #firefox preferred for ui testing
        self.driver = webdriver.Firefox(executable_path="geckodriver.exe")

    def test_login_no_input(self):
        driver = self.driver
        driver.get(frontend_address)
        driver.implicitly_wait(2)

        auth_button = driver.find_element_by_class_name('log-in')
        auth_button.click()

        login_button = driver.find_element_by_id('loginbutton')
        #click
        login_button.click()

        error = driver.find_element_by_class_name('notification')
        self.assertIn("ERROR: Username cannot be blank",error.get_attribute('innerHTML'))

    def test_login_invalid_password(self):
        driver = self.driver
        driver.get(frontend_address)
        driver.implicitly_wait(2)

        auth_button = driver.find_element_by_class_name('log-in')
        auth_button.click()

        username = 'admin'
        password = 'clearlynotthevalid'

        username_field = driver.find_element_by_name('uname')
        username_field.send_keys(username)

        password_field = driver.find_element_by_name('psw')
        password_field.send_keys(password)

        login_button = driver.find_element_by_id('loginbutton')
        #click
        login_button.click()

        time.sleep(1.5)

        error = driver.find_element_by_class_name('notification')
        self.assertIn("Invalid password",error.get_attribute('innerHTML'))
    
    def test_register_no_input(self):
        driver = self.driver
        driver.get(frontend_address)

        driver.implicitly_wait(1)

        auth_button = driver.find_element_by_class_name('log-in')
        auth_button.click()

        reg_button = driver.find_element_by_id('switchregisterbutton')
        #click
        reg_button.click()

        reg_button2 = driver.find_element_by_id('registerbutton')
        #click
        reg_button2.click()

        error = driver.find_element_by_class_name('notification')
        self.assertIn("ERROR: Username cannot be blank",error.get_attribute('innerHTML'))

    def test_register_existing_user(self):
        driver = self.driver
        driver.get(frontend_address)

        driver.implicitly_wait(2)

        auth_button = driver.find_element_by_class_name('log-in')
        auth_button.click()

        reg_button = driver.find_element_by_id('switchregisterbutton')
        #click
        reg_button.click()

        reg_button2 = driver.find_element_by_id('registerbutton')
        #click
        reg_button2.click()

        username = 'admin'
        password = '123456'
        fullname = 'ALREADY EXISTS'

        username_field = driver.find_element_by_name('rname')
        username_field.send_keys(username)

        password_field = driver.find_element_by_name('rpsw')
        password_field.send_keys(password)

        fullname_field = driver.find_element_by_name('fname')
        fullname_field.send_keys(fullname)

        reg_button = driver.find_element_by_id('registerbutton')
        reg_button.click()

        time.sleep(1.5)

        error = driver.find_element_by_class_name('notification')
        self.assertIn("Error: This username already exists",error.get_attribute('innerHTML'))

    def return_json_resp(self):
        driver = self.driver
        if(isinstance(driver,webdriver.Chrome)):
            json_response = json.loads(driver.find_element_by_tag_name('pre').text)
        elif(isinstance(driver,webdriver.Firefox)):
            json_response = json.loads(driver.find_element_by_id('json').get_attribute('innerHTML'))
        
        return json_response

    def tearDown(self): 
        self.driver.close() 

frontend_address = 'http://interact-client.herokuapp.com'
backend_address = 'http://interact-server.herokuapp.com'

if __name__ == "__main__": 
    unittest.main() 