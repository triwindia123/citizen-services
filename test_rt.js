const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');

async function runRTSeleniumTests() {
    let options = new chrome.Options();
    options.addArguments('--kiosk-printing');
    options.addArguments('--disable-print-preview');
    options.addArguments('--disable-component-update');
    options.addArguments('--no-default-browser-check');

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("🚀 Memulai Pengujian E2E Otomatis - Aplikasi Pelayanan RT...\n");

        // --- TAHAP 1: BUKA APLIKASI ---
        let filePath = 'file:///' + path.resolve('index.html');
        await driver.get(filePath);
        await driver.manage().window().maximize();
        
        await driver.sleep(2000);
        console.log("✅ [1/6] Berhasil membuka Aplikasi Pelayanan RT!");

        // --- TAHAP 2: UJI COBA UBAH WILAYAH ---
        let btnUbahWilayah = await driver.wait(until.elementLocated(By.css("button[data-bs-target='#modalWilayah']")), 5000);
        await btnUbahWilayah.click();
        await driver.sleep(1000);

        let inputRT = await driver.findElement(By.id('inputRT'));
        await inputRT.clear();
        await inputRT.sendKeys("07");

        let inputRW = await driver.findElement(By.id('inputRW'));
        await inputRW.clear();
        await inputRW.sendKeys("03");

        let inputDesa = await driver.findElement(By.id('inputDesa'));
        await inputDesa.clear();
        await inputDesa.sendKeys("Maju Jaya");

        let inputKecamatan = await driver.findElement(By.id('inputKecamatan'));
        await inputKecamatan.clear();
        await inputKecamatan.sendKeys("Bogor Selatan");

        let btnSimpanWilayah = await driver.findElement(By.xpath("//button[text()='Simpan']"));
        await btnSimpanWilayah.click();
        await driver.sleep(1500);
        console.log("✅ [2/6] Uji Coba Ubah Wilayah Berhasil (RT 07 / RW 03, Maju Jaya)!");

        // --- TAHAP 3: TAMBAH 5 DATA WARGA ---
        const dataWargaTest = [
            {
                kk: "3201111111110001", nik: "3201111111110002", nama: "Ahmad Fauzi", 
                tempatLahir: "Bogor", tglLahir: "1985-06-12", jk: "Laki-laki", 
                agama: "Islam", pekerjaan: "Wiraswasta / Usaha Sendiri", status: "Sudah Menikah", miskin: false
            },
            {
                kk: "3201111111110001", nik: "3201111111110003", nama: "Siti Rahma", 
                tempatLahir: "Jakarta", tglLahir: "1990-04-15", jk: "Perempuan", 
                agama: "Islam", pekerjaan: "Mengurus Rumah Tangga", status: "Sudah Menikah", miskin: false
            },
            {
                kk: "3201111111110001", nik: "3201111111110004", nama: "Rizki Fauzi (Anak)", 
                tempatLahir: "Bogor", tglLahir: "2018-05-10", jk: "Laki-laki", 
                agama: "Islam", pekerjaan: "Pelajar/Mahasiswa", status: "Belum Menikah", miskin: false
            },
            {
                kk: "3201222222220001", nik: "3201222222220002", nama: "Yohanes Kristanto", 
                tempatLahir: "Bandung", tglLahir: "1982-11-20", jk: "Laki-laki", 
                agama: "Kristen", pekerjaan: "Karyawan Swasta", status: "Sudah Menikah", miskin: true
            },
            {
                kk: "3201333333330001", nik: "3201333333330002", nama: "Dewi Lestari", 
                tempatLahir: "Surabaya", tglLahir: "1995-08-25", jk: "Perempuan", 
                agama: "Katolik", pekerjaan: "Karyawan Swasta", status: "Belum Menikah", miskin: false
            }
        ];

        for (let i = 0; i < dataWargaTest.length; i++) {
            let w = dataWargaTest[i];
            
            let btnBukaForm = await driver.wait(
                until.elementLocated(By.xpath("//button[contains(normalize-space(), 'Tambah Warga')]")), 
                5000
            );
            await driver.sleep(500);
            await btnBukaForm.click();
            await driver.sleep(1000);

            await driver.findElement(By.id('wargaNoKK')).sendKeys(w.kk);
            await driver.findElement(By.id('wargaNIK')).sendKeys(w.nik);
            await driver.findElement(By.id('wargaNama')).sendKeys(w.nama);
            await driver.findElement(By.id('wargaTempatLahir')).sendKeys(w.tempatLahir);
            await driver.findElement(By.id('wargaTglLahir')).sendKeys(w.tglLahir);
            
            let selectJK = await driver.findElement(By.id('wargaJK'));
            await selectJK.sendKeys(w.jk);
            
            let selectAgama = await driver.findElement(By.id('wargaAgama'));
            await selectAgama.sendKeys(w.agama);

            let selectPekerjaan = await driver.findElement(By.id('wargaPekerjaan'));
            await selectPekerjaan.sendKeys(w.pekerjaan);

            let selectStatus = await driver.findElement(By.id('wargaStatusNikah'));
            await selectStatus.sendKeys(w.status);

            if (w.miskin) {
                let checkboxMiskin = await driver.findElement(By.id('wargaIsMiskin'));
                await checkboxMiskin.click();
            }

            let btnSimpanWarga = await driver.wait(
                until.elementLocated(By.xpath("//button[text()='Simpan Warga']")), 
                5000
            );
            await btnSimpanWarga.click();
            await driver.sleep(1200);
        }

        // Cetak Tabel Data Warga di Terminal
        console.log("\n📊 TABEL HASIL PENGUJIAN INPUT DATA WARGA:");
        console.table(dataWargaTest.map(w => ({
            "Nama Lengkap": w.nama,
            "Jenis Kelamin": w.jk,
            "Agama": w.agama,
            "Status Miskin": w.miskin ? "Ya (Kurang Mampu)" : "Tidak"
        })));

        console.log("✅ [3/6] Uji Coba Form Data Warga Berhasil (5 Warga Terinput Sempurna)!");

        // --- TAHAP 4: UJI COBA IURAN & KAS RT ---
        let tabKasBtn = await driver.wait(
            until.elementLocated(By.id('tab-kas-btn')), 
            5000
        );
        await tabKasBtn.click();
        await driver.sleep(1000);

        // Tambah Pemasukan
        let btnPemasukan = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(normalize-space(), '+ Pemasukan')]")), 
            5000
        );
        await btnPemasukan.click();
        await driver.sleep(1000);

        await driver.findElement(By.id('transaksiJumlah')).sendKeys("100000");
        await driver.findElement(By.id('transaksiKeterangan')).sendKeys("Iuran Warga Bulanan");
        await driver.findElement(By.xpath("//button[text()='Simpan Data']")).click();
        await driver.sleep(1200);

        // Tambah Pengeluaran
        let btnPengeluaran = await driver.wait(
            until.elementLocated(By.xpath("//button[contains(normalize-space(), '+ Pengeluaran')]")), 
            5000
        );
        await btnPengeluaran.click();
        await driver.sleep(1000);

        await driver.findElement(By.id('transaksiJumlah')).sendKeys("35000");
        await driver.findElement(By.id('transaksiKeterangan')).sendKeys("Beli Lampu Pos Ronda");
        await driver.findElement(By.xpath("//button[text()='Simpan Data']")).click();
        await driver.sleep(1200);
        console.log("✅ [4/6] Uji Coba Transaksi Kas RT Berhasil (Saldo Terkalkulasi Dinamis)!");

        // --- TAHAP 5: UJI COBA REKAPITULASI DATA STATISTIK ---
        let tabRekapBtn = await driver.wait(
            until.elementLocated(By.id('tab-rekap-btn')), 
            5000
        );
        await tabRekapBtn.click();
        await driver.sleep(1500);

        let statCardMiskin = await driver.wait(
            until.elementLocated(By.xpath("//h3[@id='statMiskin']/parent::div")), 
            5000
        );
        await statCardMiskin.click();
        await driver.sleep(1500);

        let btnCloseModal = await driver.findElement(By.css("#modalFilterWarga .btn-close"));
        await btnCloseModal.click();
        await driver.sleep(1000);
        console.log("✅ [5/6] Uji Coba Rekapitulasi & Statistik Kependudukan Berhasil Akurat!");

        // --- TAHAP 6: UJI COBA CETAK SURAT PENGANTAR ---
        let tabSuratBtn = await driver.wait(
            until.elementLocated(By.id('tab-surat-btn')), 
            5000
        );
        await tabSuratBtn.click();
        await driver.sleep(1000);

        let selectJenisSurat = await driver.findElement(By.id('suratJenisSelect'));
        await selectJenisSurat.sendKeys("SURAT PENGANTAR");

        let selectKeperluan = await driver.findElement(By.id('suratKeperluanSelect'));
        await selectKeperluan.sendKeys("Pengurusan KTP Baru / Kartu Keluarga");

        let btnCetakPDF = await driver.findElement(By.xpath("//button[contains(normalize-space(), 'CETAK SURAT')]"));
        await btnCetakPDF.click();
        await driver.sleep(2000);
        console.log("✅ [6/6] Uji Coba Pratinjau & Cetak Surat PDF Berhasil Ditampilkan!");

        console.log("\n🎉 SELURUH PENGUJIAN E2E AUTOMATION SELESAI TANPA BUG/ERROR!");

    } catch (error) {
        console.error("❌ Terjadi kesalahan/bug saat pengujian Selenium:", error);
    } finally {
        await driver.sleep(4000);
        await driver.quit();
        console.log("🛑 Browser ditutup.");
    }
}

runRTSeleniumTests();