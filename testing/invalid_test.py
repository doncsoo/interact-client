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


    def test_content_listing(self):
        driver = self.driver
        driver.get(backend_address + '/get-videos/all')

        json_response = self.return_json_resp()

        driver.get(frontend_address)
        driver.implicitly_wait(3)
        video_buttons_titles = driver.find_elements_by_xpath("//div[@id='video-button']/div[@id='attributes']/label[1]/b")
        video_buttons_owner = driver.find_elements_by_xpath("//div[@id='video-button']/div[@id='attributes']/label[2]")

        self.assertEqual(len(json_response),len(video_buttons_titles))
        for i in range(len(json_response)):
            json_name = json_response[i]["name"]
            name_from_document = video_buttons_titles[i].get_attribute('innerHTML')
            self.assertEqual(json_name, name_from_document)

            json_owner = json_response[i]["owner"]
            owner_from_document = video_buttons_owner[i].get_attribute('innerHTML')
            self.assertEqual(json_owner, owner_from_document.replace("<b>By:</b>","").lstrip())

    def tearDown(self): 
        self.driver.close() 

frontend_address = 'http://interact-client.herokuapp.com'
backend_address = 'http://interact-server.herokuapp.com'

if __name__ == "__main__": 
    unittest.main() 