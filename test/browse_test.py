import unittest
import json
import time
from selenium import webdriver 
from selenium.webdriver.common.keys import Keys 
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys

class BrowseTest(unittest.TestCase): 

    def setUp(self):
        #chrome produces flaky test results 
        #self.driver = webdriver.Chrome("chromedriver.exe")
        #firefox preferred for ui testing
        self.driver = webdriver.Firefox(executable_path="geckodriver.exe")
    
    def return_json_resp(self):
        driver = self.driver
        if(isinstance(driver,webdriver.Chrome)):
            json_response = json.loads(driver.find_element_by_tag_name('pre').text)
        elif(isinstance(driver,webdriver.Firefox)):
            json_response = json.loads(driver.find_element_by_id('json').get_attribute('innerHTML'))
        
        return json_response

    def login_function(self, username, password):
        driver = self.driver
        auth_button = driver.find_element_by_class_name('log-in')
        auth_button.click()

        username_field = driver.find_element_by_name('uname')
        username_field.send_keys(username)

        password_field = driver.find_element_by_name('psw')
        password_field.send_keys(password)

        login_button = driver.find_element_by_id('loginbutton')
        login_button.click()

        time.sleep(1.5)

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
    
    def test_search_listing(self):
        search_term = 'content'
        driver = self.driver
        driver.get(backend_address + '/search-query/' + search_term)

        json_response = self.return_json_resp()

        driver.get(frontend_address)
        driver.implicitly_wait(3)

        search_field = driver.find_element_by_id('search-bar')
        search_field.send_keys(search_term)
        driver.find_element_by_tag_name('body').send_keys(Keys.ENTER)

        time.sleep(2)

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

    def test_user_uploads_listing(self):
        username = 'admin'
        password = 'adminpassword'
        driver = self.driver
        driver.get(backend_address + '/get-videos/' + username)

        json_response = self.return_json_resp()

        driver.get(frontend_address)
        driver.implicitly_wait(3)

        self.login_function(username, password)
        auth_button = driver.find_element_by_class_name('log-in')
        auth_button.click()

        uploads_button = driver.find_element_by_xpath("//div[@id='usermenu']/h4[2]")
        uploads_button.click()

        time.sleep(2)

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