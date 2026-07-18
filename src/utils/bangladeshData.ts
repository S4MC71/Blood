export interface DivisionData {
  [division: string]: {
    [district: string]: string[]
  }
}

export const bangladeshData: DivisionData = {
  Dhaka: {
    Dhaka: ['Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar', 'Mirpur', 'Uttara', 'Gulshan', 'Dhanmondi', 'Badda', 'Tejgaon', 'Mohammadpur', 'Jatrabari', 'Khilgaon', 'Shahbagh', 'Paltan'],
    Gazipur: ['Gazipur Sadar', 'Kaliakair', 'Kaliganj', 'Kapasia', 'Sreepur'],
    Narayanganj: ['Araihazar', 'Bandar', 'Narayanganj Sadar', 'Rupganj', 'Sonargaon'],
    Tangail: ['Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail', 'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur', 'Sakhipur', 'Dhanbari'],
    Faridpur: ['Faridpur Sadar', 'Boalmari', 'Alfadanga', 'Madhukhali', 'Bhanga', 'Sadarpur', 'Charbhadrasan', 'Saltha', 'Nagarkanda'],
    Manikganj: ['Manikganj Sadar', 'Singair', 'Shibalaya', 'Saturia', 'Harirampur', 'Gheor', 'Daulatpur'],
    Munshiganj: ['Munshiganj Sadar', 'Tongibari', 'Srinagar', 'Lauhajang', 'Gajaria', 'Sirajdikhan'],
    Narsingdi: ['Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash', 'Raipura', 'Shibpur'],
    Madaripur: ['Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'],
    Gopalganj: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'],
    Rajbari: ['Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali'],
    Shariatpur: ['Shariatpur Sadar', 'Damudya', 'Naria', 'Janjira', 'Gosairhat', 'Bhedarganj'],
    Kishoreganj: ['Kishoreganj Sadar', 'Itna', 'Katiadi', 'Bhairab', 'Tarail', 'Hossainpur', 'Pakundia', 'Kuliarchar', 'Karimgonj', 'Bajitpur', 'Nikli', 'Mithamoin', 'Austagram']
  },
  Chattogram: {
    Chattogram: ['Anwara', 'Banshkhali', 'Boalkhali', 'Chandanish', 'Fatikchhari', 'Hathazari', 'Lohagara', 'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip', 'Satkania', 'Sithakunda', 'Chittagong Sadar'],
    CoxsBazar: ['Coxs Bazar Sadar', 'Chakaria', 'Kutubdia', 'Maheshkhali', 'Ramu', 'Teknaf', 'Ukhia', 'Pekua'],
    Cumilla: ['Barura', 'Brahmanpara', 'Burichang', 'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar', 'Homna', 'Laksam', 'Muradnagar', 'Nangalkot', 'Cumilla Sadar', 'Meghna', 'Titas', 'Monohargonj', 'Sadarsouth'],
    Feni: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram', 'Sonavazi', 'Fulgazi'],
    Brahmanbaria: ['Brahmanbaria Sadar', 'Ashuganj', 'Nasirnagar', 'Nabinagar', 'Sarail', 'Kasba', 'Akhaura', 'Bancharampur', 'Bijoynagar'],
    Noakhali: ['Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companyganj', 'Hatiya', 'Senbagh', 'Subarnachar', 'Sonaimuri', 'Kabirhat'],
    Lakshmipur: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati', 'Kamalnagar'],
    Chandpur: ['Chandpur Sadar', 'Hajiganj', 'Kachua', 'Faridganj', 'Matlab North', 'Matlab South', 'Shahrasti', 'Haimchar'],
    Rangamati: ['Rangamati Sadar', 'Belaichhari', 'Bagaichhari', 'Barkal', 'Juraichhari', 'Langadu', 'Naniarchar', 'Rajasthali', 'Kaptai', 'Kawkhali'],
    Khagrachhari: ['Khagrachhari Sadar', 'Dighinala', 'Panchhari', 'Laxmichhari', 'Mahalchhari', 'Manikchhari', 'Ramgarh', 'Matiranga', 'Guimara'],
    Bandarban: ['Bandarban Sadar', 'Alikadam', 'Byangchhari', 'Dumdumia', 'Lama', 'Ruma', 'Thanchi', 'Rowangchhari']
  },
  Rajshahi: {
    Rajshahi: ['Bagha', 'Bagmara', 'Charghat', 'Durgapur', 'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore', 'Rajshahi Sadar'],
    Bogura: ['Bogura Sadar', 'Adamdighi', 'Dhunat', 'Dupchanchia', 'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi', 'Sherpur', 'Shibganj', 'Sonatala', 'Shajahanpur'],
    Pabna: ['Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar', 'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'],
    Natore: ['Natore Sadar', 'Baraigram', 'Bagatipara', 'Lalpur', 'Gurudaspur', 'Singra', 'Naldanga'],
    Joypurhat: ['Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'],
    Naogaon: ['Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat', 'Manda', 'Mahadebpur', 'Niamatpur', 'Patnitala', 'Porsha', 'Raninagar', 'Sapahar'],
    Chapainawabganj: ['Chapainawabganj Sadar', 'Bholahat', 'Gomastapur', 'Nachole', 'Shibganj'],
    Sirajganj: ['Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhanda', 'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara']
  },
  Khulna: {
    Khulna: ['Batiaghata', 'Dacope', 'Dumuria', 'Dighalia', 'Koyra', 'Paikgachha', 'Phultala', 'Rupsha', 'Terokhada', 'Khulna Sadar'],
    Jashore: ['Jashore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha', 'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha'],
    Satkhira: ['Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa', 'Kaliganj', 'Shyamnagar', 'Tala'],
    Bagerhat: ['Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua', 'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'],
    Kushtia: ['Kushtia Sadar', 'Kumarkhali', 'Khoksa', 'Mirpur', 'Daulatpur', 'Bheramara'],
    Meherpur: ['Meherpur Sadar', 'Mujibnagar', 'Gangni'],
    Chuadanga: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'],
    Jhenaidah: ['Jhenaidah Sadar', 'Harinakundu', 'Kaliganj', 'Kotchandpur', 'Maheshpur', 'Shailkupa'],
    Magura: ['Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'],
    Narail: ['Narail Sadar', 'Lohagara', 'Kalia']
  },
  Barishal: {
    Barishal: ['Barishal Sadar', 'Bakerganj', 'Babuganj', 'Wazirpur', 'Banaripara', 'Gournadi', 'Agailjhara', 'Muladi', 'Hizla', 'Mehendiganj'],
    Patuakhali: ['Patuakhali Sadar', 'Bauphal', 'Galachipa', 'Dashmina', 'Kalapara', 'Mirzaganj', 'Dumki', 'Rangabali'],
    Bhola: ['Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan', 'Lalmohan', 'Manpura', 'Tazumuddin'],
    Pirojpur: ['Pirojpur Sadar', 'Bhandaria', 'Mathbaria', 'Nazirpur', 'Nesarabad', 'Kawkhali', 'Indurkani'],
    Jhalokathi: ['Jhalokathi Sadar', 'Kathalia', 'Nalchity', 'Rajapur'],
    Barguna: ['Barguna Sadar', 'Amtali', 'Bamna', 'Patharghata', 'Betagi', 'Taltali']
  },
  Sylhet: {
    Sylhet: ['Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Companiganj', 'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur', 'Kanaighat', 'Zakiganj', 'Balaganj', 'Dakshin Surma', 'Osmaninagar'],
    Moulvibazar: ['Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj', 'Kulaura', 'Rajnagar', 'Sreemangal'],
    Habiganj: ['Habiganj Sadar', 'Bahubal', 'Madhabpur', 'Chunarughat', 'Lakhai', 'Nabiganj', 'Ajmiriganj', 'Baniyachong', 'Shayestaganj'],
    Sunamganj: ['Sunamganj Sadar', 'South Sunamganj', 'Bishwamandarpur', 'Chhatak', 'Derai', 'Dharampasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj', 'Tahirpur', 'Shalla']
  },
  Rangpur: {
    Rangpur: ['Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia', 'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'],
    Dinajpur: ['Dinajpur Sadar', 'Birganj', 'Biral', 'Bochaganj', 'Kaharole', 'Khansama', 'Ghoraghat', 'Hakimpur', 'Birol', 'Nawabganj', 'Parbatipur', 'Phulbari', 'Chirirbandar'],
    Kurigram: ['Kurigram Sadar', 'Nageshwari', 'Bhurungamari', 'Phulbari', 'Rajarhat', 'Ulipur', 'Chilmari', 'Rowmari', 'Char Rajibpur'],
    Gaibandha: ['Gaibandha Sadar', 'Sadullapur', 'Sherpur', 'Gobindaganj', 'Palashbari', 'Shaghata', 'Phulchhari'],
    Lalmonirhat: ['Lalmonirhat Sadar', 'Kaliganj', 'Aditmari', 'Hatibandha', 'Patgram'],
    Nilphamari: ['Nilphamari Sadar', 'Saidpur', 'Jaldhaka', 'Kishoreganj', 'Domar', 'Dimla'],
    Panchagarh: ['Panchagarh Sadar', 'Boda', 'Debiganj', 'Atwari', 'Tetulia'],
    Thakurgaon: ['Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Ranisankail', 'Pirganj']
  },
  Mymensingh: {
    Mymensingh: ['Mymensingh Sadar', 'Bhaluka', 'Trishal', 'Haluaghat', 'Muktagachha', 'Dhobaura', 'Fulbaria', 'Gaffargaon', 'Gauripur', 'Ishwarganj', 'Nandail', 'Phulpur', 'Tara Khanda'],
    Jamalpur: ['Jamalpur Sadar', 'Bakshiganj', 'Dewanganj', 'Isampur', 'Madarganj', 'Melandaha', 'Sarishabari'],
    Netrokona: ['Netrokona Sadar', 'Barhatta', 'Durgapur', 'Khaliajuri', 'Kalmakanda', 'Kendir', 'Madan', 'Mohanganj', 'Purbadhala', 'Atpara'],
    Sherpur: ['Sherpur Sadar', 'Nalitabari', 'Sreebardi', 'Nakla', 'Jhenaigati']
  }
}

export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
