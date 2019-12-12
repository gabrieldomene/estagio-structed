'''Scraping for fetching data from CAGR'''
import time
import re
from pymongo import MongoClient
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import TimeoutException
import sys
import pprint
import keys


<<<<<<< HEAD
client = MongoClient("mongodb://USER:PASS@ADDR.mlab.com:PORT/node-lcc-google?retryWrites=false&w=majority")
=======
client = MongoClient("mongodb://gdomenee:manaogod123@ds149682.mlab.com:49682/node-lcc-google?retryWrites=false&w=majority")
>>>>>>> e62e441ea6f2d22c13ef4517ea86243f9975f37a
db = client['node-lcc-google']
collection_name = 'disc-'+sys.argv[1]
db_collection = db[collection_name]

BASE_URL = 'http://cagr.sistemas.ufsc.br/modules/comunidade/cadastroTurmas/index.xhtml'
TABLE_ID = 'formBusca:dataTable'
FILTER_CAMPUS = ['UFSC/EaD', 'UFSC/FLO', 'UFSC/JOI', 'UFSC/CBS', 'UFSC/ARA', 'UFSC/BLN']

class CrawelerCAGR():
    '''Crawler to access CAGR and retrieve information about classes'''
    def __init__(self):
        '''Basic options for driver'''
        options = webdriver.FirefoxOptions()
        options.add_argument('--headless')
        # options.add_argument('window-size=1920x1080')
        self.driver = webdriver.Firefox(firefox_options=options)
        self.departamentos = [['FQM', 'DCS', 'DEC', 'CIT', 'EES', 'ENE', 'TIC'], ['BLU', 'CEE', 'ENG', 'MAT'], ['BSU', 'CBA', 'ABF', 'AGC', 'CBV', 'CNS', 'CRC', 'EFL', 'MVC'], ['CIN', 'EDC', 'EED', 'MEN'], ['MED', 'ACL', 'CIF', 'CLC', 'CLM', 'NFR', 'INT', 'FON', 'DTO', 'NTR', 'ODT', 'PTL', 'DPT', 'SPB'], ['AGR', 'AQI', 'CAL', 'ENR', 'EXR', 'FIT', 'ZOT'], ['BIO', 'BEG', 'BQA', 'BOT', 'CFS', 'MOR', 'ECZ', 'FMC', 'MIP'], ['FSC', 'MTM', 'QMC'], ['DIR'], ['CMA', 'ART', 'EGR', 'JOR', 'LSB', 'LLE', 'LLV'], ['EFC', 'DEF'], ['MUS', 'ANT', 'CSO', 'FIL', 'GCN', 'DGL', 'HST', 'OCN', 'PSI', 'SPO'], ['EMB'], ['CCN', 'CAD', 'CNM', 'DSS'], ['ARQ', 'DAS', 'ECV', 'EPS', 'EGC', 'EEL', 'EMC', 'EQA', 'ENS', 'INE']]
        self.centros = ['ARA', 'BLU', 'CBS', 'CED', 'CCS', 'CCA', 'CCB', 'CFM', 'CCJ', 'CCE', 'CDS', 'CFH', 'CTJ', 'CSE', 'CTC']
        self.valid = 0
        self.empty = 0
        self.numpages = 0
        self.firstitem = None
        self.wait = WebDriverWait(self.driver, 10)
        

    def get_url(self, url):
        '''Access the given url'''
        surfing_url = url
        self.driver.get(surfing_url)
        self.check_page()

    def check_page(self):
        '''Check if page initialize with table visible and try to select campus'''
        table = self.driver.find_element_by_id(TABLE_ID)
        self.select_campus()

    def select_campus(self):
        '''Iterate over the options of campus'''
        for idx, campi in enumerate(FILTER_CAMPUS):
            if idx == 0 or (campi != sys.argv[2]):
                print('entrou no if')
                continue
            available_page = True
            selected_campus = campi
            selected_id = idx
            semester = sys.argv[1]

            select_year = Select(self.driver.find_element_by_id('formBusca:selectSemestre'))
            select_year.select_by_visible_text(semester)
            select = Select(self.driver.find_element_by_id('formBusca:selectCampus'))
            select.select_by_visible_text(selected_campus)
            self.driver.find_element_by_id('formBusca:j_id119').click()

            try:
                total_results = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.XPATH, '//*[@id="formBusca:dataTableGroup"]/span')))
                
            except NoSuchElementException:
                print("Elemento não está presente - {}" .format(selected_campus))
                continue
            except TimeoutException:
                print("Estourou o tempo - {}" .format(selected_campus))
                continue
            else:
                total_results = int(self.driver.find_element_by_xpath('//*[@id="formBusca:dataTableGroup"]/span').text)

                while available_page:                                               
                    self.get_tables(selected_campus, selected_id, semester)            # Catch the displayed info in tables
                    print("Buscando [{}] - Total [{} de {}] centros" .format(selected_campus, idx+1, len(FILTER_CAMPUS)))
                    available_page = self.next_page()

            print('FINISHED [{}] \n' .format(selected_campus))
  
    def split_hour(self, input_string):
        '''X'''
        hor_dia =[]
        hor_hora = []
        hor_creditos = []
        hor_tipo = []
        horarios = re.findall(r'\d\.\d{4}\-\d', input_string)
        maximo = len(horarios)
        for i in range(maximo):
            temp = re.split(r'\.|\-', horarios[i])
            hor_dia.append(temp[0])
            hor_hora.append(temp[1])
            hor_creditos.append(temp[2])
            hor_tipo.append("1")
        return hor_dia, hor_hora, hor_creditos, hor_tipo

    def get_tables(self, filename, campus_regex, semester):
        '''Parse tables in the html page'''
        self.numpages += 1

        html = self.driver.page_source
        soup = BeautifulSoup(html, 'lxml')

        first_table = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.XPATH, '//*[@id="formBusca:dataTable:0:j_id143"]')))
        while self.firstitem == first_table:
            print('Repetiu')
            first_table = WebDriverWait(self.driver, 10).until(EC.presence_of_element_located((By.XPATH, '//*[@id="formBusca:dataTable:0:j_id143"]')))
        self.firstitem = first_table

        data = []
        table = soup.find('table', attrs={'id':'formBusca:dataTable'})
        table_body = str(table.find('tbody'))

        html_lista = table_body.split('</td>')
        disciplina = []
        turma = []
        oferta = []
        demanda = []
        hora = []
        tipo_sala = []
        proxima_turma = False
        sum_i = False
        i = 0

        for ele in html_lista:
            temp = ele.split(">")
            if not sum_i and not proxima_turma:
                x = re.search(">[A-Z]{3}", ele)
            if (not (x is None)):
                x = re.search("LOTADA", ele)
                y = re.search("ODONTOLOGIA", ele)
                z = re.search("PEDAGOGIA", ele)
                w = re.search("LETRAS", ele)
                p = re.search("DESIGN", ele)
                q = re.search("ENGENHARIA", ele)
                r = re.search("SOCIAL", ele)
                s = re.search("CIÊNCIA", ele)
                t = re.search("ANTROPOLOGIA", ele)
                u = re.search("TCC", ele)
                if x is None and y is None and z is None and w is None and p is None and q is None and r is None and s is None and t is None and u is None:
                    temp = ele.split(">")
                    disciplina.append(temp[1])
                    proxima_turma = True
                    continue
            elif proxima_turma:
                turma.append(temp[1])
                proxima_turma = False
                sum_i = True
                i = 0
                continue
            elif sum_i:
                i += 1
                if i == 3:
                    temp = ele.split(">")
                    oferta.append(temp[1])
                elif i == 4:
                    temp = ele.split(">")
                    demanda.append(temp[1])
                    continue
                elif i == 8:
                    temp = ele.split("\">")
                    hora.append(temp[1].replace("<br/>", " "))
                    sum_i = False
                    continue

        # print(len(disciplina), len(oferta), len(demanda), len(hora))
        print(disciplina)
        

        for i in range(0, len(hora)):
            novo_elemento = self.split_hour(hora[i])
            hora[i] = list(novo_elemento)
            identificador = disciplina[i]+'-'+turma[i]
            id_centro = self.assign_center(disciplina[i][:3])
            data_to_be_insert = {
                "descricao": disciplina[i],
                "fase": turma[i],
                "oferta": oferta[i],
                "demanda": demanda[i],
                "dia": hora[i][0],
                "start": hora[i][1],
                "creditos": hora[i][2],
                "tipoSalaTurma": hora[i][3],
                "idcentro": id_centro,
                "semester": semester
            }
            query = {"fase" : turma[i], "semester": semester, "descricao": disciplina[i]}
            db_collection.update(query, {"$setOnInsert": data_to_be_insert}, upsert=True)
            # print('{}-{}' .format(disciplina[i], turma[i]))

    def next_page(self):
        '''Check if there is another page in the current campus to be visited'''
        time.sleep(1)
        try:                                                                # Find the next page button through the xpath and select the first one
            self.driver.find_element_by_xpath("(.//td[contains(@onclick, 'fastforward')])[1]").click()
            return True
        except:
            print('Reached the end of pages available')
            return False

    def calculate_percentage(self, total):
        '''Calculate the percentage of items in page'''
        total_items = total
        return (50*100)/total_items

    def assign_center(self, departamento):
        try:
            id_centro = None
            if not departamento or departamento is None:
                raise ValueError
            else:
                for idx, sublist in enumerate(self.departamentos):
                    if departamento in sublist:
                        id_centro = self.centros[idx]
                if id_centro is None:
                    raise TypeError
        except ValueError as err:
            print("Str inválida [{}]" .format(departamento))
            print(err)
        except TypeError as err:
            print("Centro sem relação [{}]" .format(departamento))
            print(err)
            id_centro = 99
            return id_centro
        else:
            return id_centro

CRAWLER = CrawelerCAGR()
CRAWLER.get_url(BASE_URL)