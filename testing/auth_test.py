import unittest
import json
import time
import string
import random
from selenium import webdriver 
from selenium.webdriver.common.keys import Keys 
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains 

class AuthTest(unittest.TestCase): 

    def setUp(self):
        #chrome produces flaky test results 
        #self.driver = webdriver.Chrome("chromedriver.exe")
        #firefox preferred for ui testing
        self.driver = webdriver.Firefox(executable_path="geckodriver.exe")

    def login_function(self):
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

    def test_1_register(self):
        driver = self.driver
        driver.get('localhost:3000')
        driver.implicitly_wait(1)

        auth_button = driver.find_element_by_class_name('log-in')
        auth_button.click()

        reg_button = driver.find_element_by_id('switchregisterbutton')
        reg_button.click()

        username_field = driver.find_element_by_name('rname')
        username_field.send_keys(username)

        password_field = driver.find_element_by_name('rpsw')
        password_field.send_keys(password)

        fullname_field = driver.find_element_by_name('fname')
        fullname_field.send_keys(fullname)

        reg_button = driver.find_element_by_id('registerbutton')
        reg_button.click()

        time.sleep(1.5)

        noti = driver.find_element_by_class_name('notification')
        self.assertIn("You can now log in!",noti.get_attribute('innerHTML'))

    def test_2_login(self):
        driver = self.driver
        driver.get('localhost:3000')
        driver.implicitly_wait(1)

        self.login_function()

        auth_comp = driver.find_element_by_class_name('log-in')
        self.assertIn("Logged in as " + username, auth_comp.get_attribute('title'))
    
    def test_3_test_like(self):
        driver = self.driver
        driver.get('localhost:3000')
        driver.implicitly_wait(3)

        self.login_function()

        video_button_demo = driver.find_element_by_xpath("//div[@id='all-videos']/div[1]/div[1]")
        video_button_demo.click()

        time.sleep(3)

        like_button = driver.find_element_by_id('like-button')
        like_button.click()

        time.sleep(1.5)

        content_title_element = driver.find_element_by_id('title')
        content_title = content_title_element.get_attribute('innerHTML')

        self.assertIn('liked',like_button.get_attribute('class'))

        close_button = driver.find_element_by_class_name('close')
        close_button.click()

        auth_button = driver.find_element_by_class_name('log-in')
        auth_button.click()

        favorites_button = driver.find_element_by_xpath("//div[@id='usermenu']/h4[3]")
        favorites_button.click()

        fav_title = driver.find_element_by_xpath("//div[@id='all-videos']/div[1]/div[@id='video-button']/div[@id='attributes']/label[1]/b")
        self.assertEqual(content_title, fav_title.get_attribute('innerHTML'))

    def test_4_test_dislike(self):
        driver = self.driver
        driver.get('localhost:3000')
        driver.implicitly_wait(3)

        self.login_function()

        video_button_demo = driver.find_element_by_xpath("//div[@id='all-videos']/div[1]/div[1]")
        video_button_demo.click()

        time.sleep(3)

        like_button = driver.find_element_by_id('like-button')
        like_button.click()

        time.sleep(1.5)

        self.assertNotIn('liked',like_button.get_attribute('class'))

        close_button = driver.find_element_by_class_name('close')
        close_button.click()

        auth_button = driver.find_element_by_class_name('log-in')
        auth_button.click()

        favorites_button = driver.find_element_by_xpath("//div[@id='usermenu']/h4[3]")
        favorites_button.click()

        fav_title = driver.find_element_by_xpath("//div[@id='all-videos']/p")
        self.assertEqual("No content was found.", fav_title.get_attribute('innerHTML'))
    
    def test_5_prereq(self):
        driver = self.driver
        driver.get('localhost:3000')
        driver.implicitly_wait(3)

        self.login_function()

        video_button_prereq_demo = driver.find_element_by_xpath("//div[@id='all-videos']/div[2]/div[1]")
        video_button_prereq_demo.click()

        time.sleep(2)

        prereq_comp = driver.find_element_by_id("prereq-missing")
        self.assertEqual("block",prereq_comp.value_of_css_property("display"))

        back_button = prereq_comp.find_element_by_class_name('white')
        back_button.click()

        video_button_demo = driver.find_element_by_xpath("//div[@id='all-videos']/div[1]/div[1]")
        video_button_demo.click()

        #wait for demo content to end, length approx. 1,25 mins
        time.sleep(80)

        back_button = driver.find_element_by_xpath("//div[@id='end-title']/button")
        back_button.click()

        time.sleep(2)

        video_button_prereq_demo = driver.find_element_by_xpath("//div[@id='all-videos']/div[2]/div[1]")
        video_button_prereq_demo.click()

        time.sleep(2)

        prereq_comp = driver.find_element_by_id("prereq-missing")
        self.assertEqual("none",prereq_comp.value_of_css_property("display"))

    def tearDown(self): 
        self.driver.close()

def get_random_string(length):
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(length))
    return result_str

username = get_random_string(8)
password = get_random_string(8)
fullname = "TEST ACCOUNT"

if __name__ == "__main__": 
    unittest.main() 