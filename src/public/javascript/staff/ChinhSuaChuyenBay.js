import {
    numberWithDot,
    numberWithoutDot,
    numberSmallerTen,
    openLoader,
    closeLoader,
    getThuTrongTuan,
    getToday,
    showToast,
    onlyNumber,
    validateEmail,
    formatVND,
    ActiveNavItem_Header,
} from '../start.js';

ActiveNavItem_Header('TraCuu');

window.onlyNumber = onlyNumber;

window.addEventListener('pageshow', function (event) {
    var historyTraversal =
        event.persisted || (typeof window.performance != 'undefined' && window.performance.navigation.type === 2);
    if (historyTraversal) {
        // Handle page restore.
        window.location.reload();
    }
});

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('-');
};

Date.prototype.display = function () {
    var dd = numberSmallerTen(this.getDate());
    var mm = numberSmallerTen(this.getMonth() + 1); // getMonth() is zero-based
    var yy = this.getFullYear();
    var hr = numberSmallerTen(this.getHours());
    var min = numberSmallerTen(this.getMinutes());

    return dd + '/' + mm + '/' + yy + ' ' + hr + ':' + min;
};

function IsNgayNotNull(Ngay) {
    if (Ngay.Ngay == -1 || Ngay.Ngay == NaN) {
        return false;
    } else if (Ngay.Thang == -1 || Ngay.Thang == NaN) {
        return false;
    } else if (Ngay.Nam == -1 || Ngay.Nam == NaN) {
        return false;
    }
    return true;
}

function IsGioNotNull(Gio) {
    if (Gio.Gio == -1 || Gio.Gio == NaN) {
        return false;
    } else if (Gio.Phut == -1 || Gio.Phut == NaN) {
        return false;
    }
    return true;
}

function CreateDateFromObject(Ngay = null, Gio = null) {
    var strNgay = '';
    var strGio = '';

    if (Ngay == null) {
        strNgay = '1700/01/01';
    } else {
        if (IsNgayNotNull(Ngay) == false) {
            strNgay = '1700/01/01';
        } else {
            var dd = numberSmallerTen(Ngay.Ngay);
            var mm = numberSmallerTen(Ngay.Thang);
            var yy = numberSmallerTen(Ngay.Nam);
            strNgay = yy + '/' + mm + '/' + dd;
        }
    }
    if (Gio == null) {
        strGio = '00:00:00';
    } else {
        if (IsGioNotNull(Gio) == false) {
            strGio = '00:00:00';
        } else {
            var hr = numberSmallerTen(Gio.Gio);
            var min = numberSmallerTen(Gio.Phut);
            strGio = hr + ':' + min + ':00';
        }
    }
    return new Date(strNgay + ' ' + strGio);
}

function CreateObjectFromDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yy = date.getFullYear();
    var hr = date.getHours();
    var min = date.getMinutes();

    return {
        Ngay: {
            Ngay: dd,
            Thang: mm,
            Nam: yy,
        },
        Gio: {
            Gio: hr,
            Phut: min,
        },
    };
}

let Flight_Edit;
let SBTG_Max_Cur = 5;
let BatDauChinhSua = Date.now();
let ThoiGianKhoiHanh_ChinhSua_ToiThieu = 180;

let GioiHanThoiGianChinhSua = 15; // ko doi
let GioiHanChinhSuaNgayKhoiHanh = 7; // ko doi, 7 ng??y

// T???o g??i g???i ??i
var data_send = {
    MaChuyenBay: -1,
    MaSanBayDi: '',
    MaSanBayDen: '',
    NgayKhoiHanh: { Ngay: -1, Thang: -1, Nam: -1 },
    GioKhoiHanh: { Gio: -1, Phut: -1 },
    ThoiGianBay: -1,
    GiaVeCoBan: -1,
    TrangThai: '',
    ThoiGianBayToiThieu: -1,
    ThoiGianDungToiThieu: -1,
    SBTG_Max: -1,
    GiaVeCoBan_Min: -1,
    SBTG: [],
    HangVe: [],
};

// var SBTG_item = {
//     ThuTu: -1,
//     MaSanBay: '',
//     NgayDen: { Ngay: -1, Thang: -1, Nam: -1 },
//     GioDen: { Gio: -1, Phut: -1 },
//     ThoiGianDung: -1,
//     GhiChu: '',
// };

// var HangVe_item = {
//     MaHangGhe: '',
//     TongVe: -1,
// };

function GetFlight_Edit() {
    openLoader('Ch??? ch??t');

    if (staff_header) {
        staff_header.parentElement.removeChild(staff_header);
    }

    if (footer_planet) {
        footer_planet.parentElement.removeChild(footer_planet);
    }

    Flight_Edit = JSON.parse(document.getElementById('Flight_EditJS').getAttribute('Flight_EditJS'));

    var SanBays = structuredClone(Flight_Edit.SanBays);
    var HangGhes = structuredClone(Flight_Edit.HangGhes);
    var ThamSos = structuredClone(Flight_Edit.ThamSos);

    axios({
        method: 'post',
        url: '/flight/get-flight',
        data: { MaChuyenBay: Flight_Edit.MaChuyenBay, MaChuyenBayHienThi: Flight_Edit.MaChuyenBayHienThi },
    }).then((res) => {
        Flight_Edit = res.data;
        if (Flight_Edit) {
            Flight_Edit['MaChuyenBayHienThi'] =
                Flight_Edit.SanBayDi.MaSanBay + '-' + Flight_Edit.SanBayDen.MaSanBay + '-' + Flight_Edit.MaChuyenBay;
            Flight_Edit['SanBays'] = SanBays;
            Flight_Edit['HangGhes'] = HangGhes;
            Flight_Edit['ThamSos'] = ThamSos;
            // th??m h??? s??? v??o c??c ph???n t??? trong m???ng Flight_Edit.HangVe
            for (let i = 0; i < Flight_Edit.HangVe.length; i++) {
                var hangve = Flight_Edit.HangGhes.find((item) => item.MaHangGhe == Flight_Edit.HangVe[i].MaHangVe);
                Flight_Edit.HangVe[i].HeSo = hangve.HeSo;
            }

            // Fix ghi ch?? c???a SBTG
            Flight_Edit.SanBayTG.map((item) => {
                item.GhiChu = item.GhiChu == null ? '' : item.GhiChu;
            });

            // Sort SBTG v?? HG
            Flight_Edit.SanBayTG.sort((a, b) => {
                return a.ThuTu > b.ThuTu ? 1 : -1;
            });
            Flight_Edit.HangVe.sort((a, b) => {
                return a.GiaTien - b.GiaTien;
            });

            // Gi???i h???n th???i gian ch???nh s???a
            ThoiGianKhoiHanh_ChinhSua_ToiThieu = Flight_Edit.ThamSos.find(
                (item) => item.TenThamSo == 'ThoiGianChinhSua_Min',
            ).GiaTri;

            console.log(Flight_Edit);

            if (Flight_Edit.TrangThai == 'ViPhamQuyDinh') {
                closeLoader();
                KhoiTao_ModalChinhSua();
                var Modal = new bootstrap.Modal(document.getElementById('ModalStaticChinhSua'), true);
                Modal.show();
            } else {
                // G??n th??ng tin chuy???n bay c??? ?????nh
                document.getElementById('MaChuyenBay').value = Flight_Edit.MaChuyenBayHienThi;
                document.getElementById('SanBayDi').value = Flight_Edit.SanBayDi.TenSanBay;
                document.getElementById('SanBayDi').setAttribute('masanbay', Flight_Edit.SanBayDi.MaSanBay);
                document.getElementById('SanBayDen').value = Flight_Edit.SanBayDen.TenSanBay;
                document.getElementById('SanBayDen').setAttribute('masanbay', Flight_Edit.SanBayDen.MaSanBay);
                document.getElementById('TrangThai').setAttribute('giatri', Flight_Edit.TrangThai);

                if (Flight_Edit.TrangThai == 'ChuaKhoiHanh') {
                    document.getElementById('TrangThai').value = 'Ch??a kh???i h??nh';
                    document.getElementById('TrangThai').classList.add('text-success-light');
                } else if (Flight_Edit.TrangThai == 'DaKhoiHanh') {
                    document.getElementById('TrangThai').value = '???? kh???i h??nh';
                    document.getElementById('TrangThai').classList.add('text-success');
                } else if (Flight_Edit.TrangThai == 'DaHuy') {
                    document.getElementById('TrangThai').value = '???? h???y';
                    document.getElementById('TrangThai').classList.add('text-danger');
                } else if (Flight_Edit.TrangThai == 'ViPhamQuyDinh') {
                    document.getElementById('TrangThai').value = 'Vi ph???m quy ?????nh';
                    document.getElementById('TrangThai').classList.add('text-secondary');
                }

                document.getElementById('NgayKhoiHanh').value = CreateDateFromObject(
                    Flight_Edit.ThoiGianDi.NgayDi,
                ).yyyymmdd();

                document
                    .getElementById('GioKhoiHanh')
                    .setAttribute(
                        'value',
                        numberSmallerTen(Flight_Edit.ThoiGianDi.GioDi.Gio) +
                            ':' +
                            numberSmallerTen(Flight_Edit.ThoiGianDi.GioDi.Phut),
                    );

                document.getElementById('ThoiGianBay').value = Flight_Edit.ThoiGianBay;

                document.getElementById('ThoiGianBay').setAttribute('min', Flight_Edit.ThoiGianBayToiThieu);

                document.getElementById('GiaVeCoBan').value = numberWithDot(Flight_Edit.GiaVeCoBan);
                document.getElementById('GiaVeCoBan').setAttribute('min', Flight_Edit.GiaVeCoBan_Min);

                //H??m ch???y l???n ?????u ????? d??
                CreateData_Send();
                Start();
                KhoiTaoCountDown();
                closeLoader();
            }
        }
    });
}
if (!Flight_Edit) GetFlight_Edit();

function CreateData_Send() {
    data_send.MaChuyenBay = Flight_Edit.MaChuyenBay;
    data_send.MaSanBayDi = Flight_Edit.SanBayDi.MaSanBay;
    data_send.MaSanBayDen = Flight_Edit.SanBayDen.MaSanBay;
    data_send.NgayKhoiHanh = structuredClone(Flight_Edit.ThoiGianDi.NgayDi);
    data_send.GioKhoiHanh = structuredClone(Flight_Edit.ThoiGianDi.GioDi);
    data_send.ThoiGianBay = Flight_Edit.ThoiGianBay;
    data_send.GiaVeCoBan = Flight_Edit.GiaVeCoBan;
    data_send.TrangThai = Flight_Edit.TrangThai;
    data_send.ThoiGianBayToiThieu = Flight_Edit.ThoiGianBayToiThieu;
    data_send.ThoiGianDungToiThieu = Flight_Edit.ThoiGianDungToiThieu;
    data_send.SBTG_Max = Flight_Edit.SBTG_Max;
    data_send.GiaVeCoBan_Min = Flight_Edit.GiaVeCoBan_Min;

    Flight_Edit.SanBayTG.forEach((item) => {
        data_send.SBTG.push({
            ThuTu: item.ThuTu,
            MaSanBay: item.MaSBTG,
            NgayDen: structuredClone(item.ThoiGianDen.NgayDen),
            GioDen: structuredClone(item.ThoiGianDen.GioDen),
            ThoiGianDung: item.ThoiGianDung,
            GhiChu: item.GhiChu,
        });
    });

    Flight_Edit.HangVe.forEach((item) => {
        data_send.HangVe.push({
            MaHangGhe: item.MaHangVe,
            TongVe: item.TongVe,
        });
    });
}

function Start() {
    // Ng??y kh???i h??nh
    if (NgayKhoiHanh) {
        CapNhatThongBaoThoiGianKhoiHanh();
        NgayKhoiHanh.addEventListener('change', (e) => {
            var index = 0;
            if (e.target.value != '') {
                // GioKhoiHanh
                if (GioKhoiHanh.value != '') {
                    var ChanTruoc = GetChanTruoc(index);
                    var GiaTri = new Date(e.target.value + ' ' + GioKhoiHanh.value + ':00');

                    if (ChanTruoc != null && ChanTruoc > GiaTri) {
                        ThoiGianKhoiHanh_ThongBao.classList.add('text-danger');
                        e.target.value = CreateDateFromObject(data_send.NgayKhoiHanh, data_send.GioKhoiHanh).yyyymmdd();
                        GioKhoiHanh.value =
                            numberSmallerTen(data_send.GioKhoiHanh.Gio) +
                            ':' +
                            numberSmallerTen(data_send.GioKhoiHanh.Phut);
                        On_off_ThemDiemDung();
                        CapNhatThongBao_ThoiGianBay();
                        CapNhatThongBaoThoiGianKhoiHanh();
                        On_Off_LuuThayDoi(false);
                        return;
                    }
                    ThoiGianKhoiHanh_ThongBao.classList.remove('text-danger');

                    var ChanSau = GetChanSau(index);
                    GiaTri = new Date(GiaTri.getTime() + data_send.ThoiGianBayToiThieu * 60000);
                    if (ChanSau != null && GiaTri > ChanSau) {
                        ChanSau = new Date(ChanSau.getTime() - data_send.ThoiGianBayToiThieu * 60000);
                        showToast({
                            header: 'Th???i gian kh???i h??nh',
                            body: 'Y??u c???u t???i ??a: ' + ChanSau.display(),
                            duration: 5000,
                            type: 'danger',
                        });
                        e.target.value = CreateDateFromObject(data_send.NgayKhoiHanh, data_send.GioKhoiHanh).yyyymmdd();
                        GioKhoiHanh.value =
                            numberSmallerTen(data_send.GioKhoiHanh.Gio) +
                            ':' +
                            numberSmallerTen(data_send.GioKhoiHanh.Phut);
                        On_off_ThemDiemDung();
                        CapNhatThongBao_ThoiGianBay();
                        CapNhatThongBaoThoiGianKhoiHanh();
                        On_Off_LuuThayDoi(false);
                        return;
                    }

                    GiaTri = new Date(e.target.value + ' ' + GioKhoiHanh.value + ':00');

                    data_send.NgayKhoiHanh = structuredClone(CreateObjectFromDate(GiaTri).Ngay);
                    data_send.GioKhoiHanh = structuredClone(CreateObjectFromDate(GiaTri).Gio);

                    CapNhatThongBao_ThoiGianDen(index);
                    On_off_ThemDiemDung();
                    CapNhatThongBao_ThoiGianBay();
                    CapNhatThongBaoThoiGianKhoiHanh();
                    On_Off_LuuThayDoi(false);
                }
            }
        });
        NgayKhoiHanh.addEventListener('focus', (e) => {
            DisableAll_Focus(0);
            ThoiGianKhoiHanh_ThongBao.classList.add('text-danger');
        });
        NgayKhoiHanh.addEventListener('blur', (e) => {
            var index = 0;
            // GioKhoiHanh
            if (e.target.value != '') {
                if (GioKhoiHanh.value == '') {
                    GioKhoiHanh.focus();
                } else {
                    UnDisableAll_Blur();
                }
            } else {
                if (GioKhoiHanh.value != '') {
                    showToast({
                        header: 'Th???i gian kh???i h??nh',
                        body: 'Ng??y kh???i h??nh kh??ng ???????c tr???ng!',
                        duration: 5000,
                        type: 'danger',
                    });
                    e.target.focus();
                }
            }
            ThoiGianKhoiHanh_ThongBao.classList.remove('text-danger');
        });
    }

    // Gi??? kh???i h??nh
    if (GioKhoiHanh) {
        GioKhoiHanh.addEventListener('change', (e) => {
            var index = 0;
            if (e.target.value != '') {
                // NgayKhoiHanh
                if (NgayKhoiHanh.value != '') {
                    var ChanTruoc = GetChanTruoc(index);
                    var GiaTri = new Date(NgayKhoiHanh.value + ' ' + e.target.value + ':00');

                    if (ChanTruoc != null && ChanTruoc > GiaTri) {
                        ThoiGianKhoiHanh_ThongBao.classList.add('text-danger');
                        NgayKhoiHanh.value = CreateDateFromObject(
                            data_send.NgayKhoiHanh,
                            data_send.GioKhoiHanh,
                        ).yyyymmdd();
                        e.target.value =
                            numberSmallerTen(data_send.GioKhoiHanh.Gio) +
                            ':' +
                            numberSmallerTen(data_send.GioKhoiHanh.Phut);
                        On_off_ThemDiemDung();
                        CapNhatThongBao_ThoiGianBay();
                        CapNhatThongBaoThoiGianKhoiHanh();
                        On_Off_LuuThayDoi(false);
                        return;
                    }
                    ThoiGianKhoiHanh_ThongBao.classList.remove('text-danger');

                    var ChanSau = GetChanSau(index);
                    GiaTri = new Date(GiaTri.getTime() + data_send.ThoiGianBayToiThieu * 60000);
                    if (ChanSau != null && GiaTri > ChanSau) {
                        ChanSau = new Date(ChanSau.getTime() - data_send.ThoiGianBayToiThieu * 60000);
                        showToast({
                            header: 'Th???i gian kh???i h??nh',
                            body: 'Y??u c???u t???i ??a: ' + ChanSau.display(),
                            duration: 5000,
                            type: 'danger',
                        });
                        NgayKhoiHanh.value = CreateDateFromObject(
                            data_send.NgayKhoiHanh,
                            data_send.GioKhoiHanh,
                        ).yyyymmdd();
                        e.target.value =
                            numberSmallerTen(data_send.GioKhoiHanh.Gio) +
                            ':' +
                            numberSmallerTen(data_send.GioKhoiHanh.Phut);
                        On_off_ThemDiemDung();
                        CapNhatThongBao_ThoiGianBay();
                        CapNhatThongBaoThoiGianKhoiHanh();
                        On_Off_LuuThayDoi(false);
                        return;
                    }

                    GiaTri = new Date(NgayKhoiHanh.value + ' ' + e.target.value + ':00');

                    data_send.NgayKhoiHanh = structuredClone(CreateObjectFromDate(GiaTri).Ngay);
                    data_send.GioKhoiHanh = structuredClone(CreateObjectFromDate(GiaTri).Gio);

                    CapNhatThongBao_ThoiGianDen(index);
                    On_off_ThemDiemDung();
                    CapNhatThongBao_ThoiGianBay();
                    CapNhatThongBaoThoiGianKhoiHanh();
                    On_Off_LuuThayDoi(false);
                }
            }
        });
        GioKhoiHanh.addEventListener('blur', (e) => {
            var index = 0;
            // GioKhoiHanh
            if (e.target.value != '') {
                if (NgayKhoiHanh.value == '') {
                    NgayKhoiHanh.focus();
                } else {
                    UnDisableAll_Blur();
                }
            } else {
                if (NgayKhoiHanh.value != '') {
                    showToast({
                        header: 'Th???i gian kh???i h??nh',
                        body: 'Th???i gian kh???i h??nh kh??ng ???????c tr???ng!',
                        duration: 5000,
                        type: 'danger',
                    });
                    e.target.focus();
                }
            }
            ThoiGianKhoiHanh_ThongBao.classList.remove('text-danger');
        });
        GioKhoiHanh.addEventListener('focus', (e) => {
            DisableAll_Focus(0);
            ThoiGianKhoiHanh_ThongBao.classList.add('text-danger');
        });
    }

    // Th???i gian bay
    if (ThoiGianBay) {
        CapNhatThongBao_ThoiGianBay();
        ThoiGianBay.addEventListener('change', (e) => {
            if (e.target.value == '') {
                showToast({
                    header: 'Th???i gian bay',
                    body: 'Y??u c???u t???i thi???u ' + e.target.getAttribute('min') + ' ph??t',
                    duration: 5000,
                    type: 'warning',
                });
                e.target.value = e.target.getAttribute('min');
            } else {
                if (parseInt(e.target.value) < parseInt(e.target.getAttribute('min'))) {
                    showToast({
                        header: 'Th???i gian bay',
                        body: 'Y??u c???u t???i thi???u ' + e.target.getAttribute('min') + ' ph??t',
                        duration: 5000,
                        type: 'warning',
                    });
                    e.target.value = e.target.getAttribute('min');
                }
            }
            data_send.ThoiGianBay = parseInt(e.target.value);
            CapNhatThongBaoThoiGianKhoiHanh();
            On_off_ThemDiemDung();
            On_Off_LuuThayDoi(false);
        });
        ThoiGianBay.addEventListener('blur', (e) => {
            if (e.target.value == '') {
                e.target.value = e.target.getAttribute('min');
            } else {
                if (parseInt(e.target.value) < parseInt(e.target.getAttribute('min'))) {
                    e.target.value = e.target.getAttribute('min');
                }
            }
            ThoiGianBay_ThongBao.classList.remove('text-danger');
        });
        ThoiGianBay.addEventListener('focus', (e) => {
            ThoiGianBay_ThongBao.classList.add('text-danger');
        });
    }

    // Gi?? v?? c?? b???n
    if (GiaVeCoBan) {
        GiaVeCoBan_ThongBao.classList.remove('d-none');
        GiaVeCoBan_ThongBao.innerText = 'T???i thi???u ' + numberWithDot(data_send.GiaVeCoBan_Min) + ' VND';
        GiaVeCoBan.addEventListener('focus', (e) => {
            GiaVeCoBan_ThongBao.classList.add('text-danger');
        });
        GiaVeCoBan.addEventListener('blur', (e) => {
            GiaVeCoBan_ThongBao.classList.remove('text-danger');
            if (e.target.value == '') {
                e.target.value = numberWithDot(data_send.GiaVeCoBan);
            } else {
                if (parseInt(numberWithoutDot(e.target.value)) < data_send.GiaVeCoBan_Min) {
                    e.target.value = numberWithDot(data_send.GiaVeCoBan);
                } else {
                    e.target.value = numberWithDot(e.target.value);
                }
            }
            data_send.GiaVeCoBan = parseInt(numberWithoutDot(e.target.value));

            On_Off_LuuThayDoi(false);
        });
        GiaVeCoBan.addEventListener('keyup', (e) => {
            e.target.value = formatVND(e.target.value);
            var GiaVe = 0;
            if (e.target.value == '') {
                GiaVe = data_send.GiaVeCoBan;
            } else {
                GiaVe = parseInt(numberWithoutDot(e.target.value));
                if (GiaVe < data_send.GiaVeCoBan_Min) {
                    GiaVe = data_send.GiaVeCoBan;
                }
            }
            var HangGhe_Item_GiaVes = document.querySelectorAll('.HangGhe_Item_GiaVe');
            for (let i = 1; i < HangGhe_Item_GiaVes.length; i++) {
                var HeSo = parseFloat(HangGhe_Item_GiaVes[i].getAttribute('heso'));
                HangGhe_Item_GiaVes[i].value = numberWithDot(GiaVe * HeSo);
            }
        });
    }

    // SBTG
    Flight_Edit.SanBayTG.forEach((item) => {
        ThemSBTG(structuredClone(item));
    });
    On_off_ThemDiemDung();

    // H???ng v??
    Flight_Edit.HangVe.forEach((item) => {
        ThemHG(structuredClone(item));
    });

    // N??t th??m ??i???m d???ng
    if (ThemDiemDung) {
        ThemDiemDung.addEventListener('click', (e) => {
            ThemSBTG();
        });
    }

    // N??t th??m h???ng gh???
    if (ThemHangGhe) {
        ThemHangGhe.addEventListener('click', (e) => {
            ThemHG();
        });
    }
}

// ?????m ng?????c -- duy???t
function KhoiTaoCountDown() {
    // ?????m ng?????c kh???i h??nh
    var x = setInterval(function () {
        var now = new Date().getTime();

        if (
            IsNgayNotNull(data_send.NgayKhoiHanh) == false ||
            IsGioNotNull(data_send.GioKhoiHanh) == false ||
            NgayKhoiHanh === document.activeElement ||
            GioKhoiHanh === document.activeElement
        ) {
            Timer_Ngay.innerText = '00';
            Timer_Gio.innerText = '00';
            Timer_Phut.innerText = '00';
            Timer_Giay.innerText = '00';
            if (Timer_Card.classList.contains('bg-primary-gradient')) {
                Timer_Card.classList.remove('bg-primary-gradient');
            }
            if (Timer_Card.classList.contains('bg-secondary-gradient')) {
                Timer_Card.classList.remove('bg-secondary-gradient');
            }
            if (!Timer_Card.classList.contains('bg-tertiary')) {
                Timer_Card.classList.add('bg-tertiary');
            }
            return;
        }

        var distance = CreateDateFromObject(data_send.NgayKhoiHanh, data_send.GioKhoiHanh).getTime() - now;
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (ThoiGianKhoiHanh_ChinhSua_ToiThieu * 60 * 1000 >= distance) {
            if (Timer_Card.classList.contains('bg-primary-gradient')) {
                Timer_Card.classList.remove('bg-primary-gradient');
            }
            if (Timer_Card.classList.contains('bg-tertiary')) {
                Timer_Card.classList.remove('bg-tertiary');
            }
            if (!Timer_Card.classList.contains('bg-secondary-gradient')) {
                Timer_Card.classList.add('bg-secondary-gradient');
            }
        } else {
            if (Timer_Card.classList.contains('bg-secondary-gradient')) {
                Timer_Card.classList.remove('bg-secondary-gradient');
            }
            if (Timer_Card.classList.contains('bg-tertiary')) {
                Timer_Card.classList.remove('bg-tertiary');
            }
            if (!Timer_Card.classList.contains('bg-primary-gradient')) {
                Timer_Card.classList.add('bg-primary-gradient');
            }
        }

        Timer_Ngay.innerText = numberSmallerTen(days);
        Timer_Gio.innerText = numberSmallerTen(hours);
        Timer_Phut.innerText = numberSmallerTen(minutes);
        Timer_Giay.innerText = numberSmallerTen(seconds);

        // If the count down is over, write some text
        if (distance <= 1) {
            clearInterval(x);
            Timer_Head.innerHTML = '???? kh???i h??nh';
        }
    }, 1000);

    // ?????m ng?????c th???i gian ch???nh s???a c??n l???i
    var y = setInterval(function () {
        var now = new Date().getTime();

        var distance = BatDauChinhSua + GioiHanThoiGianChinhSua * 1000 * 60 - now;
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance > 0) {
            TimerRemain_Phut.innerText = numberSmallerTen(minutes);
            TimerRemain_Giay.innerText = numberSmallerTen(seconds);
        } else {
            TimerRemain_Phut.innerText = '00';
            TimerRemain_Giay.innerText = '00';
        }

        // If the count down is over, write some text
        if (distance <= 0) {
            clearInterval(y);

            if (CheckThayDoi(false) != false) {
                var ModalStatic = new bootstrap.Modal(document.getElementById('ModalStatic'), true);
                ModalStatic_ThayDoi.classList.remove('d-none');
                ModalStatic_Luu.classList.remove('d-none');
                ModalStatic.show();
            } else {
                var ModalStatic = new bootstrap.Modal(document.getElementById('ModalStatic'), true);
                ModalStatic.show();
            }
        }
    }, 1000);
}

function DisableAll_Focus(ThuTu) {
    var index = parseInt(ThuTu.toString());

    NgayKhoiHanh.disabled = true;
    GioKhoiHanh.disabled = true;
    var DiemDung_Item_NgayDens = document.querySelectorAll('.DiemDung_Item_NgayDen');
    var DiemDung_Item_GioDens = document.querySelectorAll('.DiemDung_Item_GioDen');
    var DiemDung_Item_ThoiGianDungs = document.querySelectorAll('.DiemDung_Item_ThoiGianDung');
    var DiemDung_Item_Xoas = document.querySelectorAll('.DiemDung_Item_Xoa');
    for (let i = 1; i < DiemDung_Item_NgayDens.length; i++) {
        DiemDung_Item_NgayDens[i].disabled = true;
        DiemDung_Item_GioDens[i].disabled = true;
        DiemDung_Item_ThoiGianDungs[i].disabled = true;
        DiemDung_Item_Xoas[i].disabled = true;
    }

    if (index == 0) {
        NgayKhoiHanh.disabled = false;
        GioKhoiHanh.disabled = false;
    } else {
        DiemDung_Item_NgayDens[index].disabled = false;
        DiemDung_Item_GioDens[index].disabled = false;
        DiemDung_Item_ThoiGianDungs[index].disabled = false;
    }
}

function UnDisableAll_Blur() {
    NgayKhoiHanh.disabled = false;
    GioKhoiHanh.disabled = false;
    var DiemDung_Item_NgayDens = document.querySelectorAll('.DiemDung_Item_NgayDen');
    var DiemDung_Item_GioDens = document.querySelectorAll('.DiemDung_Item_GioDen');
    var DiemDung_Item_ThoiGianDungs = document.querySelectorAll('.DiemDung_Item_ThoiGianDung');
    var DiemDung_Item_Xoas = document.querySelectorAll('.DiemDung_Item_Xoa');
    for (let i = 1; i < DiemDung_Item_NgayDens.length; i++) {
        DiemDung_Item_NgayDens[i].disabled = false;
        DiemDung_Item_GioDens[i].disabled = false;
        DiemDung_Item_ThoiGianDungs[i].disabled = false;
        DiemDung_Item_Xoas[i].disabled = false;
    }
}

// --------------------SBTG-----------------------

function CapNhatThongBaoThoiGianKhoiHanh() {
    var ChanTruoc = GetChanTruoc(0);
    ThoiGianKhoiHanh_ThongBao.innerText = 'Y??u c???u t???i thi???u: ' + ChanTruoc.display();
    NgayKhoiHanh.setAttribute('min', ChanTruoc.yyyymmdd());

    var ChanSau = GetChanSau(0);
    ChanSau = new Date(ChanSau.getTime() - data_send.ThoiGianBayToiThieu * 60000);
    NgayKhoiHanh.setAttribute('max', ChanSau.yyyymmdd());
}

function GetChanTruoc(ThuTu) {
    var index = parseInt(ThuTu.toString()) - 1;
    var ChanTruoc = null;
    if (index == -1) {
        if (data_send.SBTG.length > 0) {
            var lastitem = null;
            data_send.SBTG.forEach((item) => {
                if (IsNgayNotNull(item.NgayDen) == true && IsGioNotNull(item.GioDen) == true) {
                    lastitem = structuredClone(item);
                }
            });
            if (lastitem != null) {
                ChanTruoc = CreateDateFromObject(lastitem.NgayDen, lastitem.GioDen);
                ChanTruoc = new Date(ChanTruoc.getTime() - data_send.ThoiGianBay * 60000);
            }
        }
        if (ChanTruoc == null) {
            ChanTruoc = new Date(BatDauChinhSua + ThoiGianKhoiHanh_ChinhSua_ToiThieu * 60000);
        } else if (ChanTruoc < new Date(BatDauChinhSua + ThoiGianKhoiHanh_ChinhSua_ToiThieu * 60000)) {
            ChanTruoc = new Date(BatDauChinhSua + ThoiGianKhoiHanh_ChinhSua_ToiThieu * 60000);
        }
    } else if (index == 0) {
        ChanTruoc = CreateDateFromObject(data_send.NgayKhoiHanh, data_send.GioKhoiHanh);
        ChanTruoc = new Date(ChanTruoc.getTime() + data_send.ThoiGianBayToiThieu * 60000);
    } else {
        var temp = data_send.SBTG.find((item) => item.ThuTu == index);
        ChanTruoc = CreateDateFromObject(temp.NgayDen, temp.GioDen);
        ChanTruoc = new Date(ChanTruoc.getTime() + (data_send.ThoiGianBayToiThieu + temp.ThoiGianDung) * 60000);
    }
    return ChanTruoc;
}

function GetChanSau(ThuTu) {
    var index = parseInt(ThuTu.toString()) + 1;
    var ChanSau = null;
    var temp = data_send.SBTG.find((item) => item.ThuTu == index);

    if (temp == undefined) {
        if (index > 1) {
            ChanSau = CreateDateFromObject(data_send.NgayKhoiHanh, data_send.GioKhoiHanh);
            ChanSau = new Date(ChanSau.getTime() + data_send.ThoiGianBay * 60000);
        } else if (index == 1) {
            ChanSau = CreateDateFromObject(Flight_Edit.ThoiGianDi.NgayDi, Flight_Edit.ThoiGianDi.GioDi);
            ChanSau = new Date(ChanSau.getTime() + GioiHanChinhSuaNgayKhoiHanh * 24 * 60 * 60 * 1000);
        }
    } else {
        if (IsNgayNotNull(temp.NgayDen) == false || IsGioNotNull(temp.GioDen) == false) {
            ChanSau = CreateDateFromObject(Flight_Edit.ThoiGianDi.NgayDi, Flight_Edit.ThoiGianDi.GioDi);
            ChanSau = new Date(ChanSau.getTime() + GioiHanChinhSuaNgayKhoiHanh * 24 * 60 * 60 * 1000);
        } else {
            ChanSau = CreateDateFromObject(temp.NgayDen, temp.GioDen);
        }
    }
    return ChanSau;
}

// B???t t???t n??t th??m -- duy???t
function On_off_ThemDiemDung() {
    var block = false;
    CapNhatSBTG_Cur();
    if (data_send.SBTG.length >= SBTG_Max_Cur) {
        block = true;
    } else {
        const DiemDung_Items = document.querySelectorAll('.DiemDung_Item');
        for (let i = 1; i < DiemDung_Items.length; i++) {
            if (DiemDung_Items[i].querySelector('.DiemDung_Item_NgayDen').value == '') {
                block = true;
                break;
            } else if (DiemDung_Items[i].querySelector('.DiemDung_Item_GioDen').value == '') {
                block = true;
                break;
            } else if (DiemDung_Items[i].querySelector('.DiemDung_Item_ThoiGianDung').value == '') {
                block = true;
                break;
            }
        }
    }
    ThemDiemDung.disabled = block;
}

// L???y kho???ng d?? t??? ????ch -> ??i???m ?????n g???n nh???t -- duy???t
function KhoangDu() {
    var lastitem = null;
    data_send.SBTG.forEach((item) => {
        if (IsNgayNotNull(item.NgayDen) == true && IsGioNotNull(item.GioDen) == true) {
            lastitem = structuredClone(item);
        }
    });

    if (lastitem == null) {
        lastitem = { ThuTu: 0 };
    }
    var ChanTruoc = GetChanTruoc(lastitem.ThuTu + 1);
    var ChanSau = GetChanSau(data_send.SBTG.length + 1);

    return (ChanSau.getTime() - ChanTruoc.getTime()) / 60000;
}

// C???p nh???t SBTG_Max_Cur -- duy???t
function CapNhatSBTG_Cur() {
    var khoangdu = KhoangDu();
    var temp = data_send.ThoiGianBayToiThieu + data_send.ThoiGianDungToiThieu;
    khoangdu -= khoangdu % temp;
    SBTG_Max_Cur =
        data_send.SBTG.length + khoangdu / temp > data_send.SBTG_Max
            ? data_send.SBTG_Max
            : data_send.SBTG.length + khoangdu / temp;
}

function CapNhatThongBao_ThoiGianBay() {
    if (IsNgayNotNull(data_send.NgayKhoiHanh) == false || IsGioNotNull(data_send.GioKhoiHanh) == false) {
        ThoiGianBay_ThongBao.classList.add('d-none');
        ThoiGianBay_ThongBao.classList.remove('text-danger');
        return;
    }
    var ChanTruoc = CreateDateFromObject(data_send.NgayKhoiHanh, data_send.GioKhoiHanh);
    var ChanSau = null;
    if (data_send.SBTG.length > 0) {
        var lastitem = null;
        data_send.SBTG.forEach((item) => {
            if (IsNgayNotNull(item.NgayDen) == true && IsGioNotNull(item.GioDen) == true && item.ThoiGianDung > 0) {
                lastitem = item;
            }
        });
        if (lastitem != null) {
            ChanSau = CreateDateFromObject(lastitem.NgayDen, lastitem.GioDen);
            ChanSau = new Date(ChanSau.getTime() + (lastitem.ThoiGianDung + data_send.ThoiGianBayToiThieu) * 60000);
        }
    }
    if (ChanSau == null) {
        ChanSau = new Date(ChanTruoc.getTime() + data_send.ThoiGianBayToiThieu * 60000);
    }

    var distance = (ChanSau.getTime() - ChanTruoc.getTime()) / 60000;

    ThoiGianBay_ThongBao.classList.remove('d-none');
    ThoiGianBay_ThongBao.innerText = 'Y??u c???u t???i thi???u ' + distance + ' ph??t';
    ThoiGianBay.setAttribute('min', distance);
}

function CapNhatThongBao_ThoiGianDen(ThuTu) {
    // Thay ?????i ???: ThuTu + 1, c?? set min
    var index = parseInt(ThuTu.toString());
    var index_next = index + 1;
    if (index < 0) {
        return;
    }

    var DiemDung_Items = document.querySelectorAll('.DiemDung_Item');

    for (let i = 1; i < DiemDung_Items.length; i++) {
        var DiemDung_Item_ThuTu = parseInt(DiemDung_Items[i].getAttribute('index'));
        if (index_next == DiemDung_Item_ThuTu) {
            //
            var ChanTruoc = GetChanTruoc(index_next);
            var NgayGioDen_ThongBao = DiemDung_Items[i].querySelector('.NgayGioDen_ThongBao');
            NgayGioDen_ThongBao.classList.remove('d-none');
            NgayGioDen_ThongBao.innerText = 'Y??u c???u th???i gian ?????n t???i thi???u: ' + ChanTruoc.display();

            DiemDung_Items[i].querySelector('.DiemDung_Item_NgayDen').setAttribute('min', ChanTruoc.yyyymmdd());
            break;
        }
    }
}

// H??m th??m SBTG
function ThemSBTG(SBTG = null) {
    const node = document.querySelector('.DiemDung_Item').cloneNode(true);
    node.classList.remove('d-none');

    // Th??? t???
    var index = document.querySelectorAll('.DiemDung_Item').length;
    node.querySelector('.DiemDung_Item_ThuTu').value = index;
    node.setAttribute('index', index);
    node.querySelector('.DiemDung_Item_SanBayDung').setAttribute('index', index);
    node.querySelector('.DiemDung_Item_NgayDen').setAttribute('index', index);
    node.querySelector('.DiemDung_Item_GioDen').setAttribute('index', index);
    node.querySelector('.DiemDung_Item_ThoiGianDung').setAttribute('index', index);
    node.querySelector('.DiemDung_Item_GhiChu').setAttribute('index', index);
    node.querySelector('.DiemDung_Item_Xoa').setAttribute('index', index);

    // S??n bay ?????n
    const SanBayDung_ul = node.querySelector('.DiemDung_Item_SanBayDung_ul');
    const DiemDung_Item_SanBayDung_lis = SanBayDung_ul.querySelectorAll('.DiemDung_Item_SanBayDung_li');
    for (let i = 0; i < DiemDung_Item_SanBayDung_lis.length; i++) {
        DiemDung_Item_SanBayDung_lis[i].addEventListener('click', (e) => {
            // check tr??ng s??n bay
            let index = parseInt(
                e.target.closest('.input-group').querySelector('.DiemDung_Item_SanBayDung').getAttribute('index'),
            );
            let MaSB_click = e.target.querySelector('.DiemDung_Item_SanBayDung_li_MaSanBay').innerText;
            let MaSB_Di = data_send.MaSanBayDi;
            let MaSB_Den = data_send.MaSanBayDen;

            var header = '??i???m d???ng th??? ' + index;
            var index_data_send_SBTG = -1;

            if (MaSB_Di != '' && MaSB_click == MaSB_Di) {
                showToast({
                    header: header,
                    body: 'S??n bay kh??ng tr??ng s??n bay ??i',
                    duration: 5000,
                    type: 'warning',
                });
                return;
            }
            if (MaSB_Den != '' && MaSB_click == MaSB_Den) {
                showToast({
                    header: header,
                    body: 'S??n bay kh??ng tr??ng s??n bay ?????n',
                    duration: 5000,
                    type: 'warning',
                });
                return;
            }
            for (let y = 0; y < data_send.SBTG.length; y++) {
                if (index == data_send.SBTG[y].ThuTu) {
                    index_data_send_SBTG = y;
                    continue;
                }
                if (MaSB_click == data_send.SBTG[y].MaSanBay) {
                    showToast({
                        header: header,
                        body: 'Chuy???n bay ???? d???ng ??? s??n bay n??y',
                        duration: 5000,
                        type: 'warning',
                    });
                    return;
                }
            }

            var input = e.target.closest('.input-group').querySelector('.DiemDung_Item_SanBayDung');

            input.setAttribute('masanbay', MaSB_click);
            input.setAttribute('value', e.target.querySelector('.DiemDung_Item_SanBayDung_li_TenSanBay').innerText);

            data_send.SBTG[index_data_send_SBTG].MaSanBay = MaSB_click;
            On_Off_LuuThayDoi(false);
        });
    }

    // Ng??y ?????n
    node.querySelector('.DiemDung_Item_NgayDen').addEventListener('change', (e) => {
        var index = e.target.getAttribute('index');
        if (e.target.value != '') {
            const GioDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_GioDen');
            if (GioDen.value != '') {
                const ThoiGianDung = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_ThoiGianDung');
                if (ThoiGianDung.value != '') {
                    var ChanTruoc = GetChanTruoc(index);
                    var GiaTri = new Date(e.target.value + ' ' + GioDen.value + ':00');
                    var temp = data_send.SBTG.find((item) => item.ThuTu == index);
                    var NgayGioDen_ThongBao = e.target.closest('.DiemDung_Item').querySelector('.NgayGioDen_ThongBao');
                    if (ChanTruoc != null && ChanTruoc > GiaTri) {
                        NgayGioDen_ThongBao.classList.add('text-danger');
                        if (IsNgayNotNull(temp.NgayDen) == true && IsGioNotNull(temp.GioDen) == true) {
                            e.target.value = CreateDateFromObject(temp.NgayDen, temp.GioDen).yyyymmdd();
                            GioDen.value = numberSmallerTen(temp.GioDen.Gio) + ':' + numberSmallerTen(temp.GioDen.Phut);
                        } else {
                            e.target.value = '';
                            GioDen.value = '';
                            NgayDen.focus();
                        }
                        On_off_ThemDiemDung();
                        CapNhatThongBao_ThoiGianBay();
                        CapNhatThongBaoThoiGianKhoiHanh();
                        On_Off_LuuThayDoi(false);
                        return;
                    }
                    NgayGioDen_ThongBao.classList.remove('text-danger');

                    var ChanSau = GetChanSau(index);
                    GiaTri = new Date(
                        GiaTri.getTime() + (data_send.ThoiGianBayToiThieu + parseInt(ThoiGianDung.value)) * 60000,
                    );
                    if (ChanSau != null && GiaTri > ChanSau) {
                        ChanSau = new Date(
                            ChanSau.getTime() - (data_send.ThoiGianBayToiThieu + parseInt(ThoiGianDung.value)) * 60000,
                        );
                        showToast({
                            header: '??i???m d???ng th??? ' + index,
                            body: 'Y??u c???u th???i gian ?????n t???i ??a: ' + ChanSau.display(),
                            duration: 5000,
                            type: 'danger',
                        });
                        if (IsNgayNotNull(temp.NgayDen) == true && IsGioNotNull(temp.GioDen) == true) {
                            e.target.value = CreateDateFromObject(temp.NgayDen, temp.GioDen).yyyymmdd();
                            GioDen.value = numberSmallerTen(temp.GioDen.Gio) + ':' + numberSmallerTen(temp.GioDen.Phut);
                        } else {
                            e.target.value = '';
                            GioDen.value = '';
                            NgayDen.focus();
                        }

                        On_off_ThemDiemDung();
                        CapNhatThongBao_ThoiGianBay();
                        CapNhatThongBaoThoiGianKhoiHanh();
                        On_Off_LuuThayDoi(false);
                        return;
                    }

                    GiaTri = new Date(e.target.value + ' ' + GioDen.value + ':00');

                    temp.NgayDen = structuredClone(CreateObjectFromDate(GiaTri).Ngay);
                    temp.GioDen = structuredClone(CreateObjectFromDate(GiaTri).Gio);

                    CapNhatThongBao_ThoiGianDen(index);
                    On_off_ThemDiemDung();
                    CapNhatThongBao_ThoiGianBay();
                    CapNhatThongBaoThoiGianKhoiHanh();
                    On_Off_LuuThayDoi(false);
                }
            }
        }
    });
    node.querySelector('.DiemDung_Item_NgayDen').addEventListener('blur', (e) => {
        var index = e.target.getAttribute('index');
        const GioDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_GioDen');
        const ThoiGianDung = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_ThoiGianDung');
        if (e.target.value != '') {
            if (GioDen.value == '') {
                GioDen.focus();
            } else if (ThoiGianDung.value == '') {
                ThoiGianDung.focus();
            } else {
                UnDisableAll_Blur();
            }
        } else {
            if (GioDen.value != '' || ThoiGianDung.value != '') {
                showToast({
                    header: '??i???m d???ng th??? ' + index,
                    body: 'Ng??y ?????n kh??ng ???????c tr???ng!',
                    duration: 5000,
                    type: 'danger',
                });
                e.target.focus();
            }
        }
    });
    node.querySelector('.DiemDung_Item_NgayDen').addEventListener('focus', (e) => {
        var index = parseInt(e.target.getAttribute('index'));
        DisableAll_Focus(index);
    });
    // Gi??? ?????n
    node.querySelector('.DiemDung_Item_GioDen').addEventListener('change', (e) => {
        var index = parseInt(e.target.getAttribute('index'));
        if (e.target.value != '') {
            const NgayDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_NgayDen');
            if (NgayDen.value != '') {
                const ThoiGianDung = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_ThoiGianDung');
                if (ThoiGianDung.value != '') {
                    var ChanTruoc = GetChanTruoc(index);
                    var GiaTri = new Date(NgayDen.value + ' ' + e.target.value + ':00');
                    var temp = data_send.SBTG.find((item) => item.ThuTu == index);
                    var NgayGioDen_ThongBao = e.target.closest('.DiemDung_Item').querySelector('.NgayGioDen_ThongBao');

                    if (ChanTruoc != null && ChanTruoc > GiaTri) {
                        NgayGioDen_ThongBao.classList.add('text-danger');
                        if (IsNgayNotNull(temp.NgayDen) == true && IsGioNotNull(temp.GioDen) == true) {
                            e.target.value =
                                numberSmallerTen(temp.GioDen.Gio) + ':' + numberSmallerTen(temp.GioDen.Phut);
                            NgayDen.value = CreateDateFromObject(temp.NgayDen, temp.GioDen).yyyymmdd();
                        } else {
                            e.target.value = '';
                            NgayDen.value = '';
                            NgayDen.focus();
                        }
                        On_off_ThemDiemDung();
                        CapNhatThongBao_ThoiGianBay();
                        CapNhatThongBaoThoiGianKhoiHanh();
                        On_Off_LuuThayDoi(false);
                        return;
                    }
                    NgayGioDen_ThongBao.classList.remove('text-danger');

                    var ChanSau = GetChanSau(index);
                    GiaTri = new Date(
                        GiaTri.getTime() + (data_send.ThoiGianBayToiThieu + parseInt(ThoiGianDung.value)) * 60000,
                    );
                    if (ChanSau != null && GiaTri > ChanSau) {
                        ChanSau = new Date(
                            ChanSau.getTime() - (data_send.ThoiGianBayToiThieu + parseInt(ThoiGianDung.value)) * 60000,
                        );
                        showToast({
                            header: '??i???m d???ng th??? ' + index,
                            body: 'Y??u c???u th???i gian ?????n t???i ??a: ' + ChanSau.display(),
                            duration: 5000,
                            type: 'danger',
                        });
                        if (IsNgayNotNull(temp.NgayDen) == true && IsGioNotNull(temp.GioDen) == true) {
                            e.target.value =
                                numberSmallerTen(temp.GioDen.Gio) + ':' + numberSmallerTen(temp.GioDen.Phut);
                            NgayDen.value = CreateDateFromObject(temp.NgayDen, temp.GioDen).yyyymmdd();
                        } else {
                            e.target.value = '';
                            NgayDen.value = '';
                            NgayDen.focus();
                        }
                        On_off_ThemDiemDung();
                        CapNhatThongBao_ThoiGianBay();
                        CapNhatThongBaoThoiGianKhoiHanh();
                        On_Off_LuuThayDoi(false);
                        return;
                    }

                    GiaTri = new Date(NgayDen.value + ' ' + e.target.value + ':00');

                    temp.NgayDen = structuredClone(CreateObjectFromDate(GiaTri).Ngay);
                    temp.GioDen = structuredClone(CreateObjectFromDate(GiaTri).Gio);

                    CapNhatThongBao_ThoiGianDen(index);
                    On_off_ThemDiemDung();
                    CapNhatThongBao_ThoiGianBay();
                    CapNhatThongBaoThoiGianKhoiHanh();
                    On_Off_LuuThayDoi(false);
                }
            }
        }
    });
    node.querySelector('.DiemDung_Item_GioDen').addEventListener('blur', (e) => {
        var index = e.target.getAttribute('index');
        const NgayDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_NgayDen');
        const ThoiGianDung = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_ThoiGianDung');
        if (e.target.value != '') {
            if (NgayDen.value == '') {
                NgayDen.focus();
            } else if (ThoiGianDung.value == '') {
                ThoiGianDung.focus();
            } else {
                UnDisableAll_Blur();
            }
        } else {
            if (NgayDen.value != '' || ThoiGianDung.value != '') {
                showToast({
                    header: '??i???m d???ng th??? ' + index,
                    body: 'Gi??? ?????n kh??ng ???????c tr???ng!',
                    duration: 5000,
                    type: 'danger',
                });
                e.target.focus();
            }
        }
    });
    node.querySelector('.DiemDung_Item_GioDen').addEventListener('focus', (e) => {
        var index = parseInt(e.target.getAttribute('index'));
        DisableAll_Focus(index);
    });

    // Th???i gian d???ng
    node.querySelector('.DiemDung_Item_ThoiGianDung').addEventListener('change', (e) => {
        var index = e.target.getAttribute('index');
        if (e.target.value != '') {
            if (parseInt(e.target.value) < data_send.ThoiGianDungToiThieu) {
                e.target.value = data_send.ThoiGianDungToiThieu;
                showToast({
                    header: '??i???m d???ng th??? ' + index,
                    body: 'Th???i gian d???ng t???i thi???u ' + data_send.ThoiGianDungToiThieu + ' ph??t',
                    duration: 5000,
                    type: 'danger',
                });
            }
            const NgayDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_NgayDen');
            if (NgayDen.value != '') {
                const GioDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_GioDen');
                if (GioDen.value != '') {
                    var ChanSau = GetChanSau(index);
                    var GiaTri = new Date(NgayDen.value + ' ' + GioDen.value + ':00');
                    GiaTri = new Date(
                        GiaTri.getTime() + (data_send.ThoiGianBayToiThieu + parseInt(e.target.value)) * 60000,
                    );
                    var temp = data_send.SBTG.find((item) => item.ThuTu == index);
                    if (ChanSau != null && GiaTri > ChanSau) {
                        GiaTri = new Date(GiaTri.getTime() - parseInt(e.target.value) * 60000);
                        var distance = (ChanSau.getTime() - GiaTri.getTime()) / 60000;
                        showToast({
                            header: '??i???m d???ng th??? ' + index,
                            body: 'Y??u c???u th???i gian d???ng t???i ??a: ' + distance + ' ph??t',
                            duration: 5000,
                            type: 'danger',
                        });
                        e.target.value = temp.ThoiGianDung;
                        On_off_ThemDiemDung();
                        CapNhatThongBao_ThoiGianBay();
                        CapNhatThongBaoThoiGianKhoiHanh();
                        On_Off_LuuThayDoi(false);
                        return;
                    }

                    temp.ThoiGianDung = parseInt(e.target.value);
                    CapNhatThongBao_ThoiGianDen(index);
                    On_off_ThemDiemDung();
                    CapNhatThongBao_ThoiGianBay();
                    CapNhatThongBaoThoiGianKhoiHanh();
                    On_Off_LuuThayDoi(false);
                }
            }
        }
    });
    node.querySelector('.DiemDung_Item_ThoiGianDung').addEventListener('blur', (e) => {
        var index = parseInt(e.target.getAttribute('index'));
        const NgayDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_NgayDen');
        const GioDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_GioDen');
        if (e.target.value != '') {
            if (NgayDen.value == '') {
                NgayDen.focus();
            } else if (GioDen.value == '') {
                GioDen.focus();
            } else {
                e.target
                    .closest('.DiemDung_Item')
                    .querySelector('.ThoiGianDung_ThongBao')
                    .classList.remove('text-danger');
            }
        }
    });
    node.querySelector('.DiemDung_Item_ThoiGianDung').addEventListener('focus', (e) => {
        const NgayDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_NgayDen');
        const GioDen = e.target.closest('.DiemDung_Item').querySelector('.DiemDung_Item_GioDen');
        if (NgayDen.value == '') {
            showToast({
                header: '??i???m d???ng th??? ' + index,
                body: 'Vui l??ng ch???n ng??y ?????n tr?????c',
                duration: 5000,
                type: 'danger',
            });
            NgayDen.focus();
        } else if (GioDen.value == '') {
            showToast({
                header: '??i???m d???ng th??? ' + index,
                body: 'Vui l??ng ch???n gi??? ?????n tr?????c',
                duration: 5000,
                type: 'danger',
            });
            GioDen.focus();
        } else {
            e.target.closest('.DiemDung_Item').querySelector('.ThoiGianDung_ThongBao').classList.add('text-danger');
        }
    });

    node.querySelector('.DiemDung_Item_ThoiGianDung').value = data_send.ThoiGianDungToiThieu;
    node.querySelector('.DiemDung_Item_ThoiGianDung').setAttribute('min', data_send.ThoiGianDungToiThieu);
    node.querySelector('.ThoiGianDung_ThongBao').classList.remove('d-none');
    node.querySelector('.ThoiGianDung_ThongBao').innerText =
        'T???i thi???u ' + numberSmallerTen(data_send.ThoiGianDungToiThieu) + ' ph??t';

    // Ghi ch??
    node.querySelector('.DiemDung_Item_GhiChu').addEventListener('change', (e) => {
        data_send.SBTG.find((item) => item.ThuTu == index).GhiChu = e.target.value;
        On_Off_LuuThayDoi(false);
    });

    // N??t x??a
    const DiemDung_Items = document.querySelectorAll('.DiemDung_Item');
    if (DiemDung_Items.length > 1) {
        const lastitem = DiemDung_Items[DiemDung_Items.length - 1].querySelector('.DiemDung_Item_Xoa');
        lastitem.classList.add('d-none');
    }
    const NutXoa = node.querySelector('.DiemDung_Item_Xoa');
    NutXoa.classList.remove('d-none');
    NutXoa.addEventListener('click', (e) => {
        const DiemDung_Items = document.querySelectorAll('.DiemDung_Item');
        const sublastitem = DiemDung_Items[DiemDung_Items.length - 2].querySelector('.DiemDung_Item_Xoa');
        var index = parseInt(sublastitem.getAttribute('index'));
        if (DiemDung_Items.length - 1 > 1) {
            sublastitem.classList.remove('d-none');
        }

        document.getElementById('DiemDung_Container').removeChild(e.target.closest('.DiemDung_Item'));
        data_send.SBTG.pop();
        On_off_ThemDiemDung();
        CapNhatThongBao_ThoiGianBay();
        CapNhatThongBaoThoiGianKhoiHanh();
        On_Off_LuuThayDoi(false);
    });

    DiemDung_Container.appendChild(node);

    if (SBTG != null) {
        node.querySelector('.DiemDung_Item_SanBayDung').setAttribute('value', SBTG.TenSanBay);
        node.querySelector('.DiemDung_Item_SanBayDung').setAttribute('masanbay', SBTG.MaSBTG);
        node.querySelector('.DiemDung_Item_NgayDen').value =
            SBTG.ThoiGianDen.NgayDen.Nam + '-' + SBTG.ThoiGianDen.NgayDen.Thang + '-' + SBTG.ThoiGianDen.NgayDen.Ngay;
        node.querySelector('.DiemDung_Item_GioDen').value =
            numberSmallerTen(SBTG.ThoiGianDen.GioDen.Gio) + ':' + numberSmallerTen(SBTG.ThoiGianDen.GioDen.Phut);
        node.querySelector('.DiemDung_Item_ThoiGianDung').value = SBTG.ThoiGianDung;
        node.querySelector('.DiemDung_Item_GhiChu').value = SBTG.GhiChu != null ? SBTG.GhiChu : '';
    } else {
        data_send.SBTG.push({
            ThuTu: index,
            MaSanBay: '',
            NgayDen: { Ngay: -1, Thang: -1, Nam: -1 },
            GioDen: { Gio: -1, Phut: -1 },
            ThoiGianDung: data_send.ThoiGianDungToiThieu,
            GhiChu: '',
        });
        node.querySelector('.DiemDung_Item_NgayDen').focus();
    }
    CapNhatThongBao_ThoiGianDen(index - 1);
    On_off_ThemDiemDung();
    On_Off_LuuThayDoi(false);
}

// -----------------H???ng gh???--------------

// Th??m h???ng gh???
function ThemHG(HG = null) {
    const node = document.querySelector('.HangGhe_Item').cloneNode(true);
    node.classList.remove('d-none');

    // H???ng v??
    const HangGhe_Item_MaHangVe_ul = node.querySelector('.HangGhe_Item_MaHangVe_ul');
    const HangGhe_Item_MaHangVe_lis = HangGhe_Item_MaHangVe_ul.querySelectorAll('.HangGhe_Item_MaHangVe_li');
    for (let i = 0; i < HangGhe_Item_MaHangVe_lis.length; i++) {
        HangGhe_Item_MaHangVe_lis[i].addEventListener('click', (e) => {
            var MaHangGhe = e.target.querySelector('.HangGhe_Item_MaHangVe_li_Ma').innerText;
            var TenHangGhe = e.target.querySelector('.HangGhe_Item_MaHangVe_li_Ten').innerText;
            var HeSo = parseFloat(e.target.querySelector('.HangGhe_Item_MaHangVe_li_HeSo').innerText);

            var HangGhe_Item_MaHangVes = document.querySelectorAll('.HangGhe_Item_MaHangVe');
            for (let j = 1; j < HangGhe_Item_MaHangVes.length; j++) {
                if (HangGhe_Item_MaHangVes[j].getAttribute('mahangve') == MaHangGhe) {
                    showToast({
                        header: TenHangGhe,
                        body: 'H???ng gh??? ???? t???n t???i.',
                        duration: 5000,
                        type: 'warning',
                    });
                    return;
                }
            }
            var input = e.target.closest('.HangGhe_Item').querySelector('.HangGhe_Item_MaHangVe');

            input.value = TenHangGhe;
            input.setAttribute('mahangve', MaHangGhe);
            input.setAttribute('heso', HeSo);

            var GiaTien = e.target.closest('.HangGhe_Item').querySelector('.HangGhe_Item_GiaVe');
            GiaTien.value = numberWithDot(parseInt(numberWithoutDot(GiaVeCoBan.value)) * HeSo);
            GiaTien.setAttribute('heso', HeSo);

            On_Off_LuuThayDoi(false);
        });
    }

    // V?? c?? s???n
    node.querySelector('.HangGhe_Item_VeCoSan').setAttribute('value', 0);
    node.querySelector('.HangGhe_Item_VeCoSan').setAttribute('min', 0);
    node.querySelector('.HangGhe_Item_VeCoSan').addEventListener('change', (e) => {
        On_Off_LuuThayDoi(false);
    });

    // V?? ???? ph??t h??nh
    node.querySelector('.HangGhe_Item_VeDaPhatHanh').setAttribute('value', 0);
    node.querySelector('.HangGhe_Item_VeDaPhatHanh').setAttribute('min', 0);

    // N??t x??a
    const NutXoa = node.querySelector('.HangGhe_Item_Xoa');
    if (NutXoa.classList.contains('d-none')) {
        NutXoa.classList.remove('d-none');
    }
    NutXoa.addEventListener('click', (e) => {
        document.getElementById('HangGhe_Container').removeChild(e.target.closest('.HangGhe_Item'));
        On_Off_NutThemHG();
        On_Off_LuuThayDoi(false);
    });

    // -----
    if (HG != null) {
        node.querySelector('.HangGhe_Item_MaHangVe').setAttribute('value', HG.TenHangVe);
        node.querySelector('.HangGhe_Item_MaHangVe').setAttribute('mahangve', HG.MaHangVe);
        node.querySelector('.HangGhe_Item_MaHangVe').disabled = true;

        node.querySelector('.HangGhe_Item_GiaVe').setAttribute('value', numberWithDot(HG.GiaTien));
        node.querySelector('.HangGhe_Item_GiaVe').setAttribute('heso', HG.HeSo);
        node.querySelector('.HangGhe_Item_VeDaPhatHanh').setAttribute('value', HG.TongVe - HG.GheTrong);
        node.querySelector('.HangGhe_Item_VeCoSan').setAttribute('value', numberSmallerTen(HG.GheTrong));

        node.querySelector('.HangGhe_Item_Xoa').disabled = true;
    }

    HangGhe_Container.appendChild(node);
    On_Off_NutThemHG();
    On_Off_LuuThayDoi(false);
}

// B???t t???t n??t th??m
function On_Off_NutThemHG() {
    var block = false;

    var HangGhe_Item_MaHangVes = document.querySelectorAll('.HangGhe_Item_MaHangVe');
    if (HangGhe_Item_MaHangVes.length - 1 >= Flight_Edit.HangGhes.length) {
        block = true;
    }
    ThemHangGhe.disabled = block;
}

// ----------------
// H??m ki???m m???i th??? ???? thay ?????i hay ch??a -- duy???t
function CheckTrong(isshowtoast) {
    var header = '';
    var body = '';
    var check = false;

    if (NgayKhoiHanh.value == '') {
        header = 'Ng??y kh???i h??nh';
        body = 'Kh??ng ???????c tr???ng.';
        check = true;
    } else if (GioKhoiHanh.value == '') {
        header = 'Gi??? kh???i h??nh';
        body = 'Kh??ng ???????c tr???ng.';
        check = true;
    } else if (ThoiGianBay.value == '') {
        header = 'Th???i gian bay';
        body = 'Kh??ng ???????c tr???ng.';
        check = true;
    } else if (GiaVeCoBan.value == '') {
        header = 'Gi?? v?? c?? b???n';
        body = 'Kh??ng ???????c tr???ng.';
        check = true;
    } else {
        var DiemDung_Items = document.querySelectorAll('.DiemDung_Item');
        for (let i = 1; i < DiemDung_Items.length; i++) {
            var SanBay = DiemDung_Items[i].querySelector('.DiemDung_Item_SanBayDung').value;
            var NgayDen = DiemDung_Items[i].querySelector('.DiemDung_Item_NgayDen').value;
            var GioDen = DiemDung_Items[i].querySelector('.DiemDung_Item_GioDen').value;
            header = '??i???m d???ng ' + i;
            if (SanBay == '') {
                body = 'S??n bay ?????n ??ang tr???ng.';
                check = true;
                break;
            } else if (NgayDen == '') {
                body = 'Ng??y ?????n ??ang tr???ng.';
                check = true;
                break;
            } else if (GioDen == '') {
                body = 'Gi??? ?????n ??ang tr???ng.';
                check = true;
                break;
            }
        }
        if (check == false) {
            var HangGhe_Items = document.querySelectorAll('.HangGhe_Item');
            for (let i = 1; i < HangGhe_Items.length; i++) {
                var HangVe = HangGhe_Items[i].querySelector('.HangGhe_Item_MaHangVe').value;
                header = 'H???ng gh??? th??? ' + i;
                if (HangVe == '') {
                    body = 'T??n h???ng gh??? ??ang tr???ng.';
                    check = true;
                    break;
                }
            }
        }
    }

    if (check == true && isshowtoast == true) {
        showToast({
            header: header,
            body: body,
            duration: 5000,
            type: 'warning',
        });
    }
    return check;
}

// -- duy???t
function CheckThayDoi(isshowtoast) {
    var check = CheckTrong(isshowtoast);
    if (check == true) {
        return false;
    }
    // L???y nh???ng gi?? tr??? current
    if (
        data_send.NgayKhoiHanh.Ngay != Flight_Edit.ThoiGianDi.NgayDi.Ngay ||
        data_send.NgayKhoiHanh.Thang != Flight_Edit.ThoiGianDi.NgayDi.Thang ||
        data_send.NgayKhoiHanh.Nam != Flight_Edit.ThoiGianDi.NgayDi.Nam
    ) {
        check = true;
        console.log('NKH');
    }

    if (
        data_send.GioKhoiHanh.Gio != Flight_Edit.ThoiGianDi.GioDi.Gio ||
        data_send.GioKhoiHanh.Phut != Flight_Edit.ThoiGianDi.GioDi.Phut
    ) {
        check = true;
        console.log('GKH');
    }

    if (data_send.ThoiGianBay != Flight_Edit.ThoiGianBay) {
        check = true;
        console.log('TGB');
    }

    if (data_send.GiaVeCoBan != Flight_Edit.GiaVeCoBan) {
        check = true;
        console.log('GVCB');
    }

    // SBTG
    if (data_send.SBTG.length != Flight_Edit.SanBayTG.length) {
        check = true;
    }
    data_send.SBTG.forEach((item) => {
        var exist = Flight_Edit.SanBayTG.find((i) => i.ThuTu == item.ThuTu);
        if (exist == undefined) {
            check == true;
        } else {
            if (item.MaSanBay != exist.MaSBTG) {
                check = true;
            }
            if (
                item.NgayDen.Ngay != exist.ThoiGianDen.NgayDen.Ngay ||
                item.NgayDen.Thang != exist.ThoiGianDen.NgayDen.Thang ||
                item.NgayDen.Nam != exist.ThoiGianDen.NgayDen.Nam
            ) {
                check = true;
            }
            if (item.GioDen.Gio != exist.ThoiGianDen.GioDen.Gio || item.GioDen.Phut != exist.ThoiGianDen.GioDen.Phut) {
                check = true;
            }
            if (item.ThoiGianDung != exist.ThoiGianDung) {
                check = true;
            }
            if (item.GhiChu != exist.GhiChu) {
                check = true;
            }
        }
    });

    // H???ng gh???

    data_send.HangVe = [];
    var HangGhe_Items = document.querySelectorAll('.HangGhe_Item');
    for (let i = 1; i < HangGhe_Items.length; i++) {
        var mahangve = HangGhe_Items[i].querySelector('.HangGhe_Item_MaHangVe').getAttribute('mahangve');
        var vedaphathanh = parseInt(HangGhe_Items[i].querySelector('.HangGhe_Item_VeDaPhatHanh').value);
        var vecosan = parseInt(HangGhe_Items[i].querySelector('.HangGhe_Item_VeCoSan').value);

        data_send.HangVe.push({
            MaHangGhe: mahangve,
            TongVe: vedaphathanh + vecosan,
        });
    }

    data_send.HangVe.forEach((item) => {
        var exist = Flight_Edit.HangVe.find((i) => i.MaHangVe == item.MaHangGhe);
        if (exist == undefined) {
            check = true;
        } else {
            if (item.TongVe != exist.TongVe) {
                check = true;
            }
        }
    });
    return check;
}

// h??m on_off n??t l??u thay ?????i -- duy???t
function On_Off_LuuThayDoi(isshowtoast) {
    if (CheckThayDoi(isshowtoast) != false) {
        LuuThayDoi.disabled = false;
    } else {
        LuuThayDoi.disabled = true;
    }
}

// ----------------
// X??? l?? c??c modal

// H???y chuy???n bay
if (Modal_HuyChuyenBay_Thoat) {
    Modal_HuyChuyenBay_Thoat.addEventListener('click', (e) => {
        openLoader('Ch??? ch??t');
        var data_send = { MaChuyenBay: Flight_Edit.MaChuyenBay };
        axios({
            method: 'post',
            url: '/flight/cancel',
            data: data_send,
        }).then((res) => {
            closeLoader();
            var body = '';
            var type = '';
            if (res.data == true) {
                body = 'Th??nh c??ng';
                type = 'success';
            } else if (res.data == false) {
                body = 'Th???t b???i';
                type = 'danger';
            }
            showToast({
                header: 'H???y chuy???n bay',
                body: body,
                duration: 5000,
                type: type,
            });
            setTimeout(() => {
                SendForm_HuyChinhSua();
            }, 1500);
        });
    });
}

// H???y quay v??? xem chi ti???t chuy???n bay
function SendForm_HuyChinhSua() {
    var Package = {
        MaChuyenBayHienThi: Flight_Edit.MaChuyenBayHienThi,
        MaChuyenBay: Flight_Edit.MaChuyenBay,
    };
    document.getElementById('package').value = JSON.stringify(Package);
    var staff_form = document.forms['staff-form'];
    staff_form.action = '/staff/flightdetail';
    staff_form.submit();
}
// G???i g??i l??u
function SendForm_Luu() {
    openLoader('Ch??? ch??t');
    if (Flight_Edit.TrangThai == 'ViPhamQuyDinh') {
        data_send = Check_ThayDoi_Modal_ChinhSua();
    } else if (Flight_Edit.TrangThai == 'ChuaKhoiHanh') {
        data_send.TrangThai = 'ChuaKhoiHanh';
    }
    console.log(data_send);
    //return;
    axios({
        method: 'post',
        url: '/flight/update',
        data: data_send,
    }).then((res) => {
        var body = '';
        var type = '';
        if (res.data == true) {
            body = 'Th??nh c??ng';
            type = 'success';
        } else if (res.data == false) {
            body = 'Th???t b???i';
            type = 'danger';
        }
        showToast({
            header: 'C???p nh???t chuy???n bay',
            body: body,
            duration: 5000,
            type: type,
        });
        openLoader(body);
        closeLoader();
        setTimeout(() => {
            SendForm_HuyChinhSua();
        }, 1500);
    });
}

// n??t tho??t trong modal static th??ng b??o
if (ModalStatic_Thoat) {
    ModalStatic_Thoat.addEventListener('click', (e) => {
        SendForm_HuyChinhSua();
    });
}

// n??t l??u trong modal static th??ng b??o
if (ModalStatic_Luu) {
    ModalStatic_Luu.addEventListener('click', (e) => {
        SendForm_Luu();
    });
}

// n??t l??u trong modal th??ng b??o
if (Modal_Luu) {
    Modal_Luu.addEventListener('click', (e) => {
        SendForm_Luu();
    });
}

// n??t tho??t trong modal th??ng b??o
if (Modal_Thoat) {
    Modal_Thoat.addEventListener('click', (e) => {
        SendForm_HuyChinhSua();
    });
}

// N??t tho??t ??? bottom fix
if (ThoatChinhSuaChuyenBay) {
    ThoatChinhSuaChuyenBay.addEventListener('click', (e) => {
        if (CheckThayDoi(false) != false) {
            Modal_Body.innerText = 'B???n c?? mu???n l??u thay ?????i?';
            Modal_Luu.classList.remove('d-none');
            Modal_Thoat.classList.remove('d-none');
            Modal_Dong.classList.add('d-none');
        } else {
            Modal_Body.innerText = 'B???n mu???n tho??t?';
            Modal_Luu.classList.add('d-none');
            Modal_Thoat.classList.remove('d-none');
            Modal_Dong.classList.remove('d-none');
        }

        var Modal = new bootstrap.Modal(document.getElementById('Modal'), true);
        Modal.show();
    });
}

// N??t l??u ??? bottom fix
if (LuuThayDoi) {
    LuuThayDoi.addEventListener('click', (e) => {
        Modal_Body.innerText = 'B???n c?? mu???n l??u thay ?????i?';
        if (Modal_Luu.classList.contains('d-none')) {
            Modal_Luu.classList.remove('d-none');
        }
        if (!Modal_Thoat.classList.contains('d-none')) {
            Modal_Thoat.classList.add('d-none');
        }
        var Modal = new bootstrap.Modal(document.getElementById('Modal'), true);
        Modal.show();
    });
}

// ------------------------------------
// Modal ch???nh s???a

var GiaVeCoBan_Min_Check = false;
var SBTG_Max_Check = false;
var ThoiGianBay_Min_Check = false;
var ThoiGianDung_Min_Check = false;
function KhoiTao_ModalChinhSua() {
    // Gi?? v?? c?? b???n
    var GiaVeCoBan_Min_TS = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'GiaVeCoBan_Min').GiaTri;

    // SBTG_Max
    var SBTG_Max_TS = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'SBTG_Max').GiaTri;

    // Thoi gian bay toi thieu
    var ThoiGianBay_Min_TS = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'ThoiGianBayToiThieu').GiaTri;

    // Th???i gian d???ng t???i thi???u
    var ThoiGianDung_Min_TS = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'ThoiGianDungToiThieu').GiaTri;

    //--Gi?? v?? c?? b???n
    if (Flight_Edit.GiaVeCoBan < GiaVeCoBan_Min_TS) {
        GiaVeCoBan_Min_Check = true;
        ThongTinChuyenBay_ViPham.classList.remove('d-none');

        GiaVeCoBan_ViPham_div.classList.remove('d-none');

        GiaVeCoBan_ViPham_DeXuat.classList.add('text-danger');

        GiaVeCoBan_ViPham.value = numberWithDot(Flight_Edit.GiaVeCoBan);
        GiaVeCoBan_ViPham_DeXuat.innerText = 'Y??u c???u t???i thi???u ' + numberWithDot(GiaVeCoBan_Min_TS) + ' VND.';

        GiaVeCoBan_ViPham.addEventListener('keyup', (e) => {
            e.target.value = formatVND(e.target.value);
        });
        GiaVeCoBan_ViPham.addEventListener('blur', (e) => {
            if (e.target.value == '') {
                if (GiaVeCoBan_Min_TS > Flight_Edit.GiaVeCoBan) {
                    e.target.value = numberWithDot(GiaVeCoBan_Min_TS);
                } else {
                    e.target.value = numberWithDot(Flight_Edit.GiaVeCoBan);
                }
            } else {
                var GiaVe = parseInt(numberWithoutDot(e.target.value));
                if (GiaVe < GiaVeCoBan_Min_TS) {
                    if (GiaVeCoBan_Min_TS > Flight_Edit.GiaVeCoBan) {
                        e.target.value = numberWithDot(GiaVeCoBan_Min_TS);
                    } else {
                        e.target.value = numberWithDot(Flight_Edit.GiaVeCoBan);
                    }
                } else {
                    e.target.value = numberWithDot(e.target.value);
                }
            }
            On_Off_NutLuu_Modal_ChinhSua();
        });
    }

    Flight_Edit.SanBayTG.forEach((item) => {
        const node = document.querySelector('.DiemDungViPham_Item').cloneNode(true);
        node.classList.remove('d-none');

        // Th??? t???
        var index = item.ThuTu;
        node.querySelector('.DiemDungViPham_Item_ThuTu').value = index;
        node.setAttribute('index', index);
        node.setAttribute('status', 'ConSuDung');
        node.querySelector('.DiemDungViPham_Item_SanBayDung').setAttribute('index', index);
        node.querySelector('.DiemDungViPham_Item_NgayDen').setAttribute('index', index);
        node.querySelector('.DiemDungViPham_Item_GioDen').setAttribute('index', index);
        node.querySelector('.DiemDungViPham_Item_ThoiGianDung').setAttribute('index', index);
        node.querySelector('.DiemDungViPham_Item_Xoa').setAttribute('index', index);

        node.querySelector('.DiemDungViPham_Item_SanBayDung').setAttribute('value', item.TenSanBay);
        node.querySelector('.DiemDungViPham_Item_SanBayDung').setAttribute('masanbay', item.MaSBTG);

        // Ng??y ?????n
        node.querySelector('.DiemDungViPham_Item_NgayDen').value =
            item.ThoiGianDen.NgayDen.Nam + '-' + item.ThoiGianDen.NgayDen.Thang + '-' + item.ThoiGianDen.NgayDen.Ngay;
        node.querySelector('.DiemDungViPham_Item_NgayDen').addEventListener('change', (e) => {
            var index = parseInt(e.target.getAttribute('index'));
            if (e.target.value != '') {
                const GioDen = e.target.closest('.DiemDungViPham_Item').querySelector('.DiemDungViPham_Item_GioDen');
                if (GioDen.value != '') {
                    const ThoiGianDung = e.target
                        .closest('.DiemDungViPham_Item')
                        .querySelector('.DiemDungViPham_Item_ThoiGianDung');
                    if (ThoiGianDung.value != '') {
                        var lastitem = false;
                        if (Flight_Edit.SanBayTG.length == SBTG_Max_TS && index == Flight_Edit.SanBayTG.length) {
                            lastitem = true;
                        } else if (Flight_Edit.SanBayTG.length < SBTG_Max_TS && index == Flight_Edit.SanBayTG.length) {
                            lastitem = true;
                        } else if (Flight_Edit.SanBayTG.length > SBTG_Max_TS && index == SBTG_Max_TS) {
                            lastitem = true;
                        }

                        var ChanTruoc;
                        var GiaTri = new Date(e.target.value + ' ' + GioDen.value + ':00');
                        if (index == 1) {
                            ChanTruoc = CreateDateFromObject(
                                Flight_Edit.ThoiGianDi.NgayDi,
                                Flight_Edit.ThoiGianDi.GioDi,
                            );
                            ChanTruoc = new Date(ChanTruoc.getTime() + 60000 * ThoiGianBay_Min_TS);
                        } else {
                            var Item_Truoc = document.querySelectorAll('.DiemDungViPham_Item')[index - 1];
                            var NgayDen_Truoc = Item_Truoc.querySelector('.DiemDungViPham_Item_NgayDen');
                            var GioDen_Truoc = Item_Truoc.querySelector('.DiemDungViPham_Item_GioDen');
                            var ThoiGianDung_Truoc = Item_Truoc.querySelector('.DiemDungViPham_Item_ThoiGianDung');

                            ChanTruoc = new Date(NgayDen_Truoc.value + ' ' + GioDen_Truoc.value + ':00');
                            ChanTruoc = new Date(
                                ChanTruoc.getTime() + 60000 * (ThoiGianBay_Min_TS + parseInt(ThoiGianDung_Truoc.value)),
                            );
                        }

                        var ThongBao = e.target
                            .closest('.DiemDungViPham_Item')
                            .querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat');
                        if (ChanTruoc > GiaTri) {
                            ThongBao.classList.add('text-danger');

                            e.target.value = '';
                            GioDen.value = '';
                            e.target.focus();

                            ThoiGianBay_ViPham_DeXuat.classList.add('d-none');
                            ThoiGianBay_ViPham.disabled = true;
                            On_Off_NutLuu_Modal_ChinhSua();
                            return;
                        }

                        ThongBao.classList.remove('text-danger');

                        if (parseInt(ThoiGianDung.value) < ThoiGianDung_Min_TS) {
                            ThoiGianDung.focus();
                            On_Off_NutLuu_Modal_ChinhSua();
                            return;
                        }

                        if (lastitem == false) {
                            var Item_Saus = document.querySelectorAll('.DiemDungViPham_Item');
                            var ChanTruoc_Sau;
                            var GiaTri_Sau;
                            for (let i = index + 1; i < Item_Saus.length; i++) {
                                var NgayDen_Truoc = Item_Saus[i - 1].querySelector('.DiemDungViPham_Item_NgayDen');
                                var GioDen_Truoc = Item_Saus[i - 1].querySelector('.DiemDungViPham_Item_GioDen');
                                var ThoiGianDung_Truoc = Item_Saus[i - 1].querySelector(
                                    '.DiemDungViPham_Item_ThoiGianDung',
                                );
                                ChanTruoc_Sau = new Date(NgayDen_Truoc.value + ' ' + GioDen_Truoc.value + ':00');
                                ChanTruoc_Sau = new Date(
                                    ChanTruoc_Sau.getTime() +
                                        60000 * (ThoiGianBay_Min_TS + parseInt(ThoiGianDung_Truoc.value)),
                                );

                                var Item_Sau = Item_Saus[i];
                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.remove(
                                    'd-none',
                                );

                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').innerText =
                                    'Th???i gian ?????n t???i thi???u: ' + ChanTruoc_Sau.display();

                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayDen').setAttribute(
                                    'min',
                                    ChanTruoc_Sau.yyyymmdd(),
                                );

                                Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat').classList.remove(
                                    'd-none',
                                );

                                Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat').innerText =
                                    'Th???i gian d???ng t???i thi???u: ' + numberSmallerTen(ThoiGianDung_Min_TS) + ' ph??t.';

                                Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung').setAttribute(
                                    'min',
                                    ThoiGianDung_Min_TS,
                                );

                                if (
                                    parseInt(Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung').value) <
                                    ThoiGianDung_Min_TS
                                ) {
                                    Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung').value =
                                        ThoiGianDung_Min_TS;
                                }

                                var NgayDen_Sau = Item_Sau.querySelector('.DiemDungViPham_Item_NgayDen');
                                var GioDen_Sau = Item_Sau.querySelector('.DiemDungViPham_Item_GioDen');
                                var ThoiGianDung_Sau = Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung');

                                NgayDen_Sau.setAttribute('vipham', true);
                                ThoiGianDung_Sau.setAttribute('vipham', true);

                                GiaTri_Sau = new Date(NgayDen_Sau.value + ' ' + GioDen_Sau.value + ':00');

                                if (ChanTruoc_Sau > GiaTri_Sau) {
                                    NgayDen_Sau.value = '';
                                    GioDen_Sau.value = '';

                                    Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.add(
                                        'text-danger',
                                    );

                                    ThoiGianBay_ViPham_DeXuat.classList.add('d-none');
                                    ThoiGianBay_ViPham.disabled = true;
                                    NgayDen_Sau.disabled = false;
                                    NgayDen_Sau.focus();
                                    On_Off_NutLuu_Modal_ChinhSua();
                                    return;
                                }
                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.remove(
                                    'text-danger',
                                );
                            }

                            CapNhatMinThoiGianBayViPham();
                        } else {
                            CapNhatMinThoiGianBayViPham();
                            ThoiGianBay_ViPham.focus();
                        }
                        On_Off_NutLuu_Modal_ChinhSua();
                    }
                }
            }
        });
        node.querySelector('.DiemDungViPham_Item_NgayDen').addEventListener('blur', (e) => {
            var index = e.target.getAttribute('index');
            const GioDen = e.target.closest('.DiemDungViPham_Item').querySelector('.DiemDungViPham_Item_GioDen');
            const ThoiGianDung = e.target
                .closest('.DiemDungViPham_Item')
                .querySelector('.DiemDungViPham_Item_ThoiGianDung');
            if (e.target.value != '') {
                if (GioDen.value == '') {
                    GioDen.focus();
                } else if (ThoiGianDung.value == '' || parseInt(ThoiGianDung.value) < ThoiGianDung_Min_TS) {
                    ThoiGianDung.focus();
                } else {
                    UnDisableAllViPham_Blur();
                }
            } else {
                if (GioDen.value != '' || ThoiGianDung.value != '') {
                    e.target.focus();
                }
            }
        });
        node.querySelector('.DiemDungViPham_Item_NgayDen').addEventListener('focus', (e) => {
            var index = e.target.getAttribute('index');
            DisableAllViPham_Focus(index);
        });

        // Gi??? ?????n
        node.querySelector('.DiemDungViPham_Item_GioDen').value =
            numberSmallerTen(item.ThoiGianDen.GioDen.Gio) + ':' + numberSmallerTen(item.ThoiGianDen.GioDen.Phut);
        node.querySelector('.DiemDungViPham_Item_GioDen').addEventListener('change', (e) => {
            var index = parseInt(e.target.getAttribute('index'));
            if (e.target.value != '') {
                const NgayDen = e.target.closest('.DiemDungViPham_Item').querySelector('.DiemDungViPham_Item_NgayDen');
                if (NgayDen.value != '') {
                    const ThoiGianDung = e.target
                        .closest('.DiemDungViPham_Item')
                        .querySelector('.DiemDungViPham_Item_ThoiGianDung');
                    if (ThoiGianDung.value != '') {
                        var lastitem = false;
                        if (Flight_Edit.SanBayTG.length == SBTG_Max_TS && index == Flight_Edit.SanBayTG.length) {
                            lastitem = true;
                        } else if (Flight_Edit.SanBayTG.length < SBTG_Max_TS && index == Flight_Edit.SanBayTG.length) {
                            lastitem = true;
                        } else if (Flight_Edit.SanBayTG.length > SBTG_Max_TS && index == SBTG_Max_TS) {
                            lastitem = true;
                        }

                        var ChanTruoc;
                        var GiaTri = new Date(NgayDen.value + ' ' + e.target.value + ':00');
                        if (index == 1) {
                            ChanTruoc = CreateDateFromObject(
                                Flight_Edit.ThoiGianDi.NgayDi,
                                Flight_Edit.ThoiGianDi.GioDi,
                            );
                            ChanTruoc = new Date(ChanTruoc.getTime() + 60000 * ThoiGianBay_Min_TS);
                        } else {
                            var Item_Truoc = document.querySelectorAll('.DiemDungViPham_Item')[index - 1];
                            var NgayDen_Truoc = Item_Truoc.querySelector('.DiemDungViPham_Item_NgayDen');
                            var GioDen_Truoc = Item_Truoc.querySelector('.DiemDungViPham_Item_GioDen');
                            var ThoiGianDung_Truoc = Item_Truoc.querySelector('.DiemDungViPham_Item_ThoiGianDung');

                            ChanTruoc = new Date(NgayDen_Truoc.value + ' ' + GioDen_Truoc.value + ':00');
                            ChanTruoc = new Date(
                                ChanTruoc.getTime() + 60000 * (ThoiGianBay_Min_TS + parseInt(ThoiGianDung_Truoc.value)),
                            );
                        }

                        var ThongBao = e.target
                            .closest('.DiemDungViPham_Item')
                            .querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat');
                        if (ChanTruoc > GiaTri) {
                            ThongBao.classList.add('text-danger');

                            e.target.value = '';
                            NgayDen.value = '';
                            NgayDen.focus();
                            ThoiGianBay_ViPham_DeXuat.classList.add('d-none');
                            ThoiGianBay_ViPham.disabled = true;
                            On_Off_NutLuu_Modal_ChinhSua();
                            return;
                        }

                        ThongBao.classList.remove('text-danger');

                        if (parseInt(ThoiGianDung.value) < ThoiGianDung_Min_TS) {
                            ThoiGianDung.focus();
                            On_Off_NutLuu_Modal_ChinhSua();
                            return;
                        }

                        if (lastitem == false) {
                            var Item_Saus = document.querySelectorAll('.DiemDungViPham_Item');
                            var ChanTruoc_Sau;
                            var GiaTri_Sau;
                            for (let i = index + 1; i < Item_Saus.length; i++) {
                                var NgayDen_Truoc = Item_Saus[i - 1].querySelector('.DiemDungViPham_Item_NgayDen');
                                var GioDen_Truoc = Item_Saus[i - 1].querySelector('.DiemDungViPham_Item_GioDen');
                                var ThoiGianDung_Truoc = Item_Saus[i - 1].querySelector(
                                    '.DiemDungViPham_Item_ThoiGianDung',
                                );
                                ChanTruoc_Sau = new Date(NgayDen_Truoc.value + ' ' + GioDen_Truoc.value + ':00');
                                ChanTruoc_Sau = new Date(
                                    ChanTruoc_Sau.getTime() +
                                        60000 * (ThoiGianBay_Min_TS + parseInt(ThoiGianDung_Truoc.value)),
                                );

                                var Item_Sau = Item_Saus[i];
                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.remove(
                                    'd-none',
                                );

                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').innerText =
                                    'Th???i gian ?????n t???i thi???u: ' + ChanTruoc_Sau.display();

                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayDen').setAttribute(
                                    'min',
                                    ChanTruoc_Sau.yyyymmdd(),
                                );

                                Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat').classList.remove(
                                    'd-none',
                                );

                                Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat').innerText =
                                    'Th???i gian d???ng t???i thi???u: ' + numberSmallerTen(ThoiGianDung_Min_TS) + ' ph??t.';

                                Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung').setAttribute(
                                    'min',
                                    ThoiGianDung_Min_TS,
                                );

                                if (
                                    parseInt(Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung').value) <
                                    ThoiGianDung_Min_TS
                                ) {
                                    Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung').value =
                                        ThoiGianDung_Min_TS;
                                }

                                var NgayDen_Sau = Item_Sau.querySelector('.DiemDungViPham_Item_NgayDen');
                                var GioDen_Sau = Item_Sau.querySelector('.DiemDungViPham_Item_GioDen');
                                var ThoiGianDung_Sau = Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung');

                                NgayDen_Sau.setAttribute('vipham', true);
                                ThoiGianDung_Sau.setAttribute('vipham', true);

                                GiaTri_Sau = new Date(NgayDen_Sau.value + ' ' + GioDen_Sau.value + ':00');

                                if (ChanTruoc_Sau > GiaTri_Sau) {
                                    NgayDen_Sau.value = '';
                                    GioDen_Sau.value = '';

                                    Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.add(
                                        'text-danger',
                                    );

                                    ThoiGianBay_ViPham_DeXuat.classList.add('d-none');
                                    ThoiGianBay_ViPham.disabled = true;
                                    NgayDen_Sau.disabled = false;
                                    NgayDen_Sau.focus();
                                    On_Off_NutLuu_Modal_ChinhSua();
                                    return;
                                }
                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.remove(
                                    'text-danger',
                                );
                            }

                            CapNhatMinThoiGianBayViPham();
                        } else {
                            CapNhatMinThoiGianBayViPham();
                            ThoiGianBay_ViPham.focus();
                        }
                        On_Off_NutLuu_Modal_ChinhSua();
                    }
                }
            }
        });
        node.querySelector('.DiemDungViPham_Item_GioDen').addEventListener('blur', (e) => {
            var index = e.target.getAttribute('index');
            const NgayDen = e.target.closest('.DiemDungViPham_Item').querySelector('.DiemDungViPham_Item_NgayDen');
            const ThoiGianDung = e.target
                .closest('.DiemDungViPham_Item')
                .querySelector('.DiemDungViPham_Item_ThoiGianDung');
            if (e.target.value != '') {
                if (NgayDen.value == '') {
                    NgayDen.focus();
                } else if (ThoiGianDung.value == '') {
                    ThoiGianDung.focus();
                } else {
                    UnDisableAllViPham_Blur();
                }
            } else {
                if (NgayDen.value == '') {
                    NgayDen.focus();
                } else {
                    e.target.focus();
                }
            }
        });
        node.querySelector('.DiemDungViPham_Item_GioDen').addEventListener('focus', (e) => {
            var index = e.target.getAttribute('index');
            const NgayDen = e.target.closest('.DiemDungViPham_Item').querySelector('.DiemDungViPham_Item_NgayDen');
            const ThoiGianDung = e.target
                .closest('.DiemDungViPham_Item')
                .querySelector('.DiemDungViPham_Item_ThoiGianDung');
            if (e.target.value != '') {
                if (NgayDen.value == '') {
                    NgayDen.focus();
                } else if (ThoiGianDung.value == '') {
                    ThoiGianDung.focus();
                } else {
                    DisableAllViPham_Focus(index);
                }
            } else {
                if (NgayDen.value == '') {
                    NgayDen.focus();
                } else {
                    e.target.focus();
                }
            }
        });

        // Th???i gian d???ng
        node.querySelector('.DiemDungViPham_Item_ThoiGianDung').value = item.ThoiGianDung;
        node.querySelector('.DiemDungViPham_Item_ThoiGianDung').addEventListener('change', (e) => {
            var index = parseInt(e.target.getAttribute('index'));
            if (e.target.value != '') {
                if (parseInt(e.target.value) < parseInt(e.target.getAttribute('min'))) {
                    e.target.value = e.target.getAttribute('min');
                }
                e.target
                    .closest('.DiemDungViPham_Item')
                    .querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat')
                    .classList.remove('text-danger');
                const NgayDen = e.target.closest('.DiemDungViPham_Item').querySelector('.DiemDungViPham_Item_NgayDen');
                if (NgayDen.value != '') {
                    const GioDen = e.target
                        .closest('.DiemDungViPham_Item')
                        .querySelector('.DiemDungViPham_Item_GioDen');
                    if (GioDen.value != '') {
                        var lastitem = false;
                        if (Flight_Edit.SanBayTG.length == SBTG_Max_TS && index == Flight_Edit.SanBayTG.length) {
                            lastitem = true;
                        } else if (Flight_Edit.SanBayTG.length < SBTG_Max_TS && index == Flight_Edit.SanBayTG.length) {
                            lastitem = true;
                        } else if (Flight_Edit.SanBayTG.length > SBTG_Max_TS && index == SBTG_Max_TS) {
                            lastitem = true;
                        }

                        var GiaTri = new Date(NgayDen.value + ' ' + GioDen.value + ':00');

                        if (lastitem == false) {
                            var Item_Saus = document.querySelectorAll('.DiemDungViPham_Item');
                            var ChanTruoc_Sau;
                            var GiaTri_Sau;
                            for (let i = index + 1; i < Item_Saus.length; i++) {
                                var NgayDen_Truoc = Item_Saus[i - 1].querySelector('.DiemDungViPham_Item_NgayDen');
                                var GioDen_Truoc = Item_Saus[i - 1].querySelector('.DiemDungViPham_Item_GioDen');
                                var ThoiGianDung_Truoc = Item_Saus[i - 1].querySelector(
                                    '.DiemDungViPham_Item_ThoiGianDung',
                                );
                                ChanTruoc_Sau = new Date(NgayDen_Truoc.value + ' ' + GioDen_Truoc.value + ':00');
                                ChanTruoc_Sau = new Date(
                                    ChanTruoc_Sau.getTime() +
                                        60000 * (ThoiGianBay_Min_TS + parseInt(ThoiGianDung_Truoc.value)),
                                );

                                var Item_Sau = Item_Saus[i];
                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.remove(
                                    'd-none',
                                );

                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').innerText =
                                    'Th???i gian ?????n t???i thi???u: ' + ChanTruoc_Sau.display();

                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayDen').setAttribute(
                                    'min',
                                    ChanTruoc_Sau.yyyymmdd(),
                                );

                                Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat').classList.remove(
                                    'd-none',
                                );

                                Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat').innerText =
                                    'Th???i gian d???ng t???i thi???u: ' + numberSmallerTen(ThoiGianDung_Min_TS) + ' ph??t.';

                                Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung').setAttribute(
                                    'min',
                                    ThoiGianDung_Min_TS,
                                );

                                if (
                                    parseInt(Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung').value) <
                                    ThoiGianDung_Min_TS
                                ) {
                                    Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung').value =
                                        ThoiGianDung_Min_TS;
                                }

                                var NgayDen_Sau = Item_Sau.querySelector('.DiemDungViPham_Item_NgayDen');
                                var GioDen_Sau = Item_Sau.querySelector('.DiemDungViPham_Item_GioDen');
                                var ThoiGianDung_Sau = Item_Sau.querySelector('.DiemDungViPham_Item_ThoiGianDung');

                                NgayDen_Sau.setAttribute('vipham', true);
                                ThoiGianDung_Sau.setAttribute('vipham', true);

                                GiaTri_Sau = new Date(NgayDen_Sau.value + ' ' + GioDen_Sau.value + ':00');

                                if (ChanTruoc_Sau > GiaTri_Sau) {
                                    NgayDen_Sau.value = '';
                                    GioDen_Sau.value = '';

                                    Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.add(
                                        'text-danger',
                                    );

                                    ThoiGianBay_ViPham_DeXuat.classList.add('d-none');
                                    ThoiGianBay_ViPham.disabled = true;
                                    NgayDen_Sau.disabled = false;
                                    NgayDen_Sau.focus();
                                    On_Off_NutLuu_Modal_ChinhSua();
                                    return;
                                }
                                Item_Sau.querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.remove(
                                    'text-danger',
                                );
                            }

                            CapNhatMinThoiGianBayViPham();
                        } else {
                            CapNhatMinThoiGianBayViPham();
                            ThoiGianBay_ViPham.focus();
                        }
                        On_Off_NutLuu_Modal_ChinhSua();
                    }
                }
            } else {
                e.target.value = e.target.getAttribute('min');
            }
        });
        node.querySelector('.DiemDungViPham_Item_ThoiGianDung').addEventListener('focus', (e) => {
            var index = e.target.getAttribute('index');
            const NgayDen = e.target.closest('.DiemDungViPham_Item').querySelector('.DiemDungViPham_Item_NgayDen');
            const GioDen = e.target.closest('.DiemDungViPham_Item').querySelector('.DiemDungViPham_Item_GioDen');
            e.target
                .closest('.DiemDungViPham_Item')
                .querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat')
                .classList.add('text-danger');
            if (e.target.value != '') {
                if (NgayDen.value == '') {
                    NgayDen.focus();
                } else if (GioDen.value == '') {
                    GioDen.focus();
                }
            } else {
                if (NgayDen.value == '') {
                    NgayDen.focus();
                } else {
                    e.target.focus();
                }
            }
        });
        node.querySelector('.DiemDungViPham_Item_ThoiGianDung').addEventListener('blur', (e) => {
            if (parseInt(e.target.value) >= parseInt(e.target.getAttribute('min'))) {
                e.target
                    .closest('.DiemDungViPham_Item')
                    .querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat')
                    .classList.remove('text-danger');
            }
            UnDisableAllViPham_Blur();
        });
        DiemDungViPham_Container.appendChild(node);
    });

    //--SBTG_Max
    if (Flight_Edit.SanBayTG.length > SBTG_Max_TS) {
        SBTG_Max_Check = true;
        const DiemDungViPham_Items = document.querySelectorAll('.DiemDungViPham_Item');
        for (let i = SBTG_Max_TS + 1; i < DiemDungViPham_Items.length; i++) {
            DiemDungViPham_Items[i].setAttribute('status', 'KhongSuDung');
            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').innerText =
                '??i???m d???ng s??? b??? x??a do: S??? ??i???m d???ng t???i ??a l?? ' + SBTG_Max_TS;

            DiemDungViPham_Items[i]
                .querySelector('.DiemDungViPham_Item_ThoiGianDung_DonVi')
                .classList.remove('bg-light');

            DiemDungViPham_Items[i].querySelector('.blank').classList.add('d-none');
            DiemDungViPham_Items[i]
                .querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat_div')
                .classList.remove('col-6');
            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat_div').classList.add('col-9');

            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.remove('d-none');

            DiemDungViPham_Items[i]
                .querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat')
                .classList.add('text-danger');

            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat').classList.add('d-none');
        }
    }

    // Th???i gian bay vi ph???m
    ThoiGianBay_ViPham.value = Flight_Edit.ThoiGianBay;
    ThoiGianBay_ViPham.setAttribute('min', 0);
    ThoiGianBay_ViPham.addEventListener('blur', (e) => {
        if (e.target.value == '') {
            if (Flight_Edit.ThoiGianBay < parseInt(e.target.getAttribute('min'))) {
                e.target.value = e.target.getAttribute('min');
            } else {
                e.target.value = Flight_Edit.ThoiGianBay;
            }
        } else {
            if (parseInt(e.target.value) < parseInt(e.target.getAttribute('min'))) {
                if (Flight_Edit.ThoiGianBay < parseInt(e.target.getAttribute('min'))) {
                    e.target.value = e.target.getAttribute('min');
                } else {
                    e.target.value = Flight_Edit.ThoiGianBay;
                }
            }
        }
        On_Off_NutLuu_Modal_ChinhSua();
    });

    //--Th???i gian d???ng t???i thi???u && Thoi gian bay toi thieu
    const DiemDungViPham_Items = document.querySelectorAll('.DiemDungViPham_Item');
    if (DiemDungViPham_Items.length == 1) {
        // Ko c?? SBTG
        ThongTinDiemDung_ViPham.classList.add('d-none');
        DiemDungViPham_Container.classList.add('d-none');
        if (ThoiGianBay_Min_TS > Flight_Edit.ThoiGianBay) {
            ThoiGianBay_Min_Check = true;
            ThoiGianBay_ViPham_div.classList.remove('d-none');
            ThongTinChuyenBay_ViPham.classList.remove('d-none');

            ThoiGianBay_ViPham_DeXuat.classList.remove('d-none');
            ThoiGianBay_ViPham_DeXuat.innerText = 'Y??u c???u t???i thi???u: ' + ThoiGianBay_Min_TS + ' ph??t.';
            ThoiGianBay_ViPham_DeXuat.classList.remove('text-danger');

            ThoiGianBay_ViPham.setAttribute('min', ThoiGianBay_Min_TS);
            ThoiGianBay_ViPham.disabled = false;

            ThoiGianBay_ViPham.focus();
        }
    } else if (DiemDungViPham_Items.length > 1 && DiemDungViPham_Items[1].getAttribute('status') != 'KhongSuDung') {
        // C?? SBTG
        var ChanTruoc = CreateDateFromObject(Flight_Edit.ThoiGianDi.NgayDi, Flight_Edit.ThoiGianDi.GioDi);
        ChanTruoc = new Date(ChanTruoc.getTime() + 60000 * ThoiGianBay_Min_TS);
        var GiaTri = CreateDateFromObject(
            Flight_Edit.SanBayTG[0].ThoiGianDen.NgayDen,
            Flight_Edit.SanBayTG[0].ThoiGianDen.GioDen,
        );
        var i = 1;
        if (ChanTruoc > GiaTri) {
            ThoiGianBay_Min_Check = true;
            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayDen').setAttribute('vipham', true);
            ThongTinChuyenBay_ViPham.classList.remove('d-none');
            ThoiGianBay_ViPham_div.classList.remove('d-none');
            ThoiGianBay_ViPham_DeXuat.classList.add('d-none');
            ThoiGianBay_ViPham.disabled = true;

            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayDen').disabled = false;
            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_GioDen').disabled = false;

            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayDen').value = '';
            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_GioDen').value = '';

            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').classList.remove('d-none');

            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').innerText =
                'Th???i gian ?????n t???i thi???u: ' + ChanTruoc.display();

            DiemDungViPham_Items[i]
                .querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat')
                .classList.add('text-danger');

            DiemDungViPham_Items[i]
                .querySelector('.DiemDungViPham_Item_NgayDen')
                .setAttribute('min', ChanTruoc.yyyymmdd());
        }

        if (ThoiGianDung_Min_TS > Flight_Edit.SanBayTG[0].ThoiGianDung) {
            ThoiGianDung_Min_Check = true;
            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung').setAttribute('vipham', true);
            ThongTinChuyenBay_ViPham.classList.remove('d-none');
            ThoiGianBay_ViPham_div.classList.remove('d-none');
            ThoiGianBay_ViPham_DeXuat.classList.add('d-none');
            ThoiGianBay_ViPham.disabled = true;

            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung').disabled = false;
            DiemDungViPham_Items[i]
                .querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat')
                .classList.remove('d-none');
            DiemDungViPham_Items[i]
                .querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat')
                .classList.add('text-danger');

            DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat').innerText =
                'Th???i gian d???ng t???i thi???u: ' + numberSmallerTen(ThoiGianDung_Min_TS) + ' ph??t.';
            DiemDungViPham_Items[i]
                .querySelector('.DiemDungViPham_Item_ThoiGianDung')
                .setAttribute('min', ThoiGianDung_Min_TS);
        }

        if (ThoiGianBay_Min_Check == false && ThoiGianDung_Min_Check == false) {
            for (i = 2; i < DiemDungViPham_Items.length; i++) {
                if (DiemDungViPham_Items[i].getAttribute('status') == 'KhongSuDung') {
                    break;
                }
                if (ThoiGianDung_Min_TS > Flight_Edit.SanBayTG[i - 1].ThoiGianDung) {
                    ThoiGianDung_Min_Check = true;
                    DiemDungViPham_Items[i]
                        .querySelector('.DiemDungViPham_Item_ThoiGianDung')
                        .setAttribute('vipham', true);
                    ThongTinChuyenBay_ViPham.classList.remove('d-none');
                    ThoiGianBay_ViPham_div.classList.remove('d-none');
                    ThoiGianBay_ViPham_DeXuat.classList.add('d-none');
                    ThoiGianBay_ViPham.disabled = true;

                    DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung').disabled = false;
                    DiemDungViPham_Items[i]
                        .querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat')
                        .classList.remove('d-none');

                    DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat').innerText =
                        'Th???i gian d???ng t???i thi???u: ' + numberSmallerTen(ThoiGianDung_Min_TS) + ' ph??t.';
                    DiemDungViPham_Items[i]
                        .querySelector('.DiemDungViPham_Item_ThoiGianDung_DeXuat')
                        .classList.add('text-danger');
                    DiemDungViPham_Items[i]
                        .querySelector('.DiemDungViPham_Item_ThoiGianDung')
                        .setAttribute('min', ThoiGianDung_Min_TS);
                }

                GiaTri = CreateDateFromObject(
                    Flight_Edit.SanBayTG[i - 1].ThoiGianDen.NgayDen,
                    Flight_Edit.SanBayTG[i - 1].ThoiGianDen.GioDen,
                );
                ChanTruoc = CreateDateFromObject(
                    Flight_Edit.SanBayTG[i - 2].ThoiGianDen.NgayDen,
                    Flight_Edit.SanBayTG[i - 2].ThoiGianDen.GioDen,
                );
                ChanTruoc = new Date(
                    ChanTruoc.getTime() + 60000 * (ThoiGianBay_Min_TS + Flight_Edit.SanBayTG[i - 2].ThoiGianDung),
                );

                if (ChanTruoc > GiaTri) {
                    ThoiGianBay_Min_Check = true;
                    DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayDen').setAttribute('vipham', true);
                    ThongTinChuyenBay_ViPham.classList.remove('d-none');
                    ThoiGianBay_ViPham_div.classList.remove('d-none');
                    ThoiGianBay_ViPham_DeXuat.classList.add('d-none');
                    ThoiGianBay_ViPham.disabled = true;

                    DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayDen').disabled = false;
                    DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_GioDen').disabled = false;

                    DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayDen').value = '';
                    DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_GioDen').value = '';

                    DiemDungViPham_Items[i]
                        .querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat')
                        .classList.remove('d-none');

                    DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat').innerText =
                        'Th???i gian ?????n t???i thi???u: ' + ChanTruoc.display();

                    DiemDungViPham_Items[i]
                        .querySelector('.DiemDungViPham_Item_NgayGioDen_DeXuat')
                        .classList.add('text-danger');

                    DiemDungViPham_Items[i]
                        .querySelector('.DiemDungViPham_Item_NgayDen')
                        .setAttribute('min', ChanTruoc.yyyymmdd());
                }
                if (ThoiGianBay_Min_Check == true || ThoiGianDung_Min_Check == true) break;
            }
        }

        if (ThoiGianBay_Min_Check == false && ThoiGianDung_Min_Check == false) {
            if (SBTG_Max_Check == false) {
                ThongTinDiemDung_ViPham.classList.add('d-none');
                DiemDungViPham_Container.classList.add('d-none');
            }
        }
    }

    On_Off_NutLuu_Modal_ChinhSua();
}

// Check thay ?????i modal ch???nh s???a
function Check_ThayDoi_Modal_ChinhSua() {
    var check = false;

    // Tr???ng
    if (GiaVeCoBan_Min_Check == true) {
        var GiaVeCoBan_Min_TS = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'GiaVeCoBan_Min').GiaTri;
        if (GiaVeCoBan_ViPham.value == '') {
            return check;
        } else if (parseInt(numberWithoutDot(GiaVeCoBan_ViPham.value)) < GiaVeCoBan_Min_TS) {
            return check;
        }
    }
    if (ThoiGianBay_Min_Check == true || ThoiGianDung_Min_Check == true) {
        if (ThoiGianBay_ViPham.value == '') {
            return check;
        } else if (parseInt(ThoiGianBay_ViPham.value) < parseInt(ThoiGianBay_ViPham.getAttribute('min'))) {
            return check;
        }

        var DiemDungViPham_Items = document.querySelectorAll('.DiemDungViPham_Item');
        for (let i = 1; i < DiemDungViPham_Items.length; i++) {
            if (DiemDungViPham_Items[i].getAttribute('status') == 'KhongSuDung') {
                break;
            }

            if (DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayDen').value == '') {
                return check;
            }

            if (DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_GioDen').value == '') {
                return check;
            }

            if (
                DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung').value == '' ||
                parseInt(DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung').value) <
                    parseInt(
                        DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung').getAttribute('min'),
                    )
            ) {
                return check;
            }
        }
    }

    // T???o g??i g???i ??i
    var data_send = {
        MaChuyenBay: -1,
        NgayKhoiHanh: { Ngay: -1, Thang: -1, Nam: -1 },
        GioKhoiHanh: { Gio: -1, Phut: -1 },
        ThoiGianBay: -1, // sau
        GiaVeCoBan: -1, //sau
        TrangThai: '',
        ThoiGianBayToiThieu: -1,
        ThoiGianDungToiThieu: -1,
        SBTG_Max: -1,
        GiaVeCoBan_Min: -1,
        SBTG: [], // sau
        HangVe: [],
    };

    // var SBTG_item = {
    //     ThuTu: -1,
    //     MaSanBay: '',
    //     NgayDen: { Ngay: -1, Thang: -1, Nam: -1 },
    //     GioDen: { Gio: -1, Phut: -1 },
    //     ThoiGianDung: -1,
    //     GhiChu: '',
    // };

    // var HangVe_item = {
    //     MaHangGhe: '',
    //     TongVe: -1,
    // };
    data_send.MaChuyenBay = Flight_Edit.MaChuyenBay;
    data_send.NgayKhoiHanh = structuredClone(Flight_Edit.ThoiGianDi.NgayDi);
    data_send.GioKhoiHanh = structuredClone(Flight_Edit.ThoiGianDi.GioDi);
    data_send.TrangThai = 'ChuaKhoiHanh';
    data_send.ThoiGianBayToiThieu = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'ThoiGianBayToiThieu').GiaTri;
    data_send.ThoiGianDungToiThieu = Flight_Edit.ThamSos.find(
        (item) => item.TenThamSo == 'ThoiGianDungToiThieu',
    ).GiaTri;
    data_send.SBTG_Max = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'SBTG_Max').GiaTri;
    data_send.GiaVeCoBan_Min = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'GiaVeCoBan_Min').GiaTri;

    Flight_Edit.HangVe.forEach((item) => {
        data_send.HangVe.push({
            MaHangGhe: item.MaHangVe,
            TongVe: item.TongVe,
        });
    });

    // Thay ?????i
    if (GiaVeCoBan_Min_Check == true && parseInt(numberWithoutDot(GiaVeCoBan_ViPham.value)) >= GiaVeCoBan_Min_TS) {
        data_send.GiaVeCoBan = parseInt(numberWithoutDot(GiaVeCoBan_ViPham.value));
        check = true;
    } else {
        data_send.GiaVeCoBan = Flight_Edit.GiaVeCoBan;
    }

    if (ThoiGianBay_Min_Check == true || ThoiGianDung_Min_Check == true) {
        if (parseInt(ThoiGianBay_ViPham.value) >= parseInt(ThoiGianBay_ViPham.getAttribute('min'))) {
            data_send.ThoiGianBay = parseInt(ThoiGianBay_ViPham.value);
            check = true;
        }

        var DiemDungViPham_Items = document.querySelectorAll('.DiemDungViPham_Item');
        for (let i = 1; i < DiemDungViPham_Items.length; i++) {
            if (DiemDungViPham_Items[i].getAttribute('status') == 'KhongSuDung') {
                break;
            }

            var NgayDen = new Date(
                DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_NgayDen').value +
                    ' ' +
                    DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_GioDen').value +
                    ':00',
            );

            var ThoiGianDung = parseInt(
                DiemDungViPham_Items[i].querySelector('.DiemDungViPham_Item_ThoiGianDung').value,
            );

            data_send.SBTG.push({
                ThuTu: Flight_Edit.SanBayTG[i - 1].ThuTu,
                MaSanBay: Flight_Edit.SanBayTG[i - 1].MaSBTG,
                NgayDen: { Ngay: NgayDen.getDate(), Thang: NgayDen.getMonth() + 1, Nam: NgayDen.getFullYear() },
                GioDen: { Gio: NgayDen.getHours(), Phut: NgayDen.getMinutes() },
                ThoiGianDung: ThoiGianDung,
                GhiChu: Flight_Edit.SanBayTG[i - 1].GhiChu,
            });
            check = true;
        }
    } else {
        Flight_Edit.SanBayTG.forEach((item) => {
            data_send.SBTG.push({
                ThuTu: item.ThuTu,
                MaSanBay: item.MaSBTG,
                NgayDen: structuredClone(item.ThoiGianDen.NgayDen),
                GioDen: structuredClone(item.ThoiGianDen.GioDen),
                ThoiGianDung: item.ThoiGianDung,
                GhiChu: item.GhiChu,
            });
        });
        if (SBTG_Max_Check == true) {
            check = true;
            var SBTG_Max_TS = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'SBTG_Max').GiaTri;
            for (let i = 0; i < Flight_Edit.SanBayTG.length - SBTG_Max_TS; i++) {
                data_send.SBTG.pop();
            }
        }
        data_send.ThoiGianBay = Flight_Edit.ThoiGianBay;
    }

    if (check == true) {
        return data_send;
    }
    return check;
}
// On_off n??t l??u modal ch???nh s???a
function On_Off_NutLuu_Modal_ChinhSua() {
    if (Check_ThayDoi_Modal_ChinhSua() != false) {
        ModalStaticChinhSua_Luu.disabled = false;
    } else {
        ModalStaticChinhSua_Luu.disabled = true;
    }
}

function DisableAllViPham_Focus(ThuTu) {
    var index = parseInt(ThuTu.toString());

    var DiemDung_Item_NgayDens = document.querySelectorAll('.DiemDungViPham_Item_NgayDen ');
    var DiemDung_Item_GioDens = document.querySelectorAll('.DiemDungViPham_Item_GioDen');
    var DiemDung_Item_ThoiGianDungs = document.querySelectorAll('.DiemDungViPham_Item_ThoiGianDung');
    for (let i = 1; i < DiemDung_Item_NgayDens.length; i++) {
        DiemDung_Item_NgayDens[i].disabled = true;
        DiemDung_Item_GioDens[i].disabled = true;
        DiemDung_Item_ThoiGianDungs[i].disabled = true;
    }

    if (DiemDung_Item_NgayDens[index].getAttribute('vipham') == 'true') {
        DiemDung_Item_NgayDens[index].disabled = false;
        DiemDung_Item_GioDens[index].disabled = false;
    }
    if (DiemDung_Item_ThoiGianDungs[index].getAttribute('vipham') == 'true') {
        DiemDung_Item_ThoiGianDungs[index].disabled = false;
    }
}

function UnDisableAllViPham_Blur() {
    //????y
    var DiemDungViPham_Items = document.querySelectorAll('.DiemDungViPham_Item');
    var DiemDung_Item_NgayDens = document.querySelectorAll('.DiemDungViPham_Item_NgayDen');
    var DiemDung_Item_GioDens = document.querySelectorAll('.DiemDungViPham_Item_GioDen');
    var DiemDung_Item_ThoiGianDungs = document.querySelectorAll('.DiemDungViPham_Item_ThoiGianDung');

    for (let i = 1; i < DiemDung_Item_NgayDens.length; i++) {
        if (DiemDungViPham_Items[i].getAttribute('status') == 'KhongSuDung') break;

        if (DiemDung_Item_NgayDens[i].getAttribute('vipham') == 'true') {
            DiemDung_Item_NgayDens[i].disabled = false;
            DiemDung_Item_GioDens[i].disabled = false;
        }
        if (DiemDung_Item_ThoiGianDungs[i].getAttribute('vipham') == 'true') {
            DiemDung_Item_ThoiGianDungs[i].disabled = false;
        }
    }
}

function CapNhatMinThoiGianBayViPham() {
    ThoiGianBay_ViPham_DeXuat.classList.remove('d-none');
    ThoiGianBay_ViPham.disabled = false;
    ThoiGianBay_ViPham_div.classList.remove('d-none');

    var ChanTruoc = CreateDateFromObject(Flight_Edit.ThoiGianDi.NgayDi, Flight_Edit.ThoiGianDi.GioDi);
    var ThoiGianBay_Min_TS = Flight_Edit.ThamSos.find((item) => item.TenThamSo == 'ThoiGianBayToiThieu').GiaTri;
    var ChanSau = null;
    var DiemDungViPham_Items = document.querySelectorAll('.DiemDungViPham_Item');
    var DiemDung_Item_NgayDens = document.querySelectorAll('.DiemDungViPham_Item_NgayDen');
    var DiemDung_Item_GioDens = document.querySelectorAll('.DiemDungViPham_Item_GioDen');
    var DiemDung_Item_ThoiGianDungs = document.querySelectorAll('.DiemDungViPham_Item_ThoiGianDung');

    for (let i = DiemDung_Item_NgayDens.length - 1; i > 0; i--) {
        if (DiemDungViPham_Items[i].getAttribute('status') == 'KhongSuDung') continue;

        if (
            DiemDung_Item_NgayDens[i].value != '' &&
            DiemDung_Item_GioDens[i].value != '' &&
            DiemDung_Item_ThoiGianDungs[i].value != ''
        ) {
            ChanSau = new Date(DiemDung_Item_NgayDens[i].value + ' ' + DiemDung_Item_GioDens[i].value + ':00');
            ChanSau = new Date(
                ChanSau.getTime() + 60000 * (parseInt(DiemDung_Item_ThoiGianDungs[i].value) + ThoiGianBay_Min_TS),
            );
            break;
        }
    }

    if (ChanSau == null) {
        ChanSau = new Date(ChanTruoc.getTime() + 60000 * ThoiGianBay_Min_TS);
    }

    var distance = (ChanSau.getTime() - ChanTruoc.getTime()) / 60000;
    if (parseInt(ThoiGianBay_ViPham.value) < distance) {
        ThoiGianBay_ViPham.setAttribute('value', distance);
    }
    ThoiGianBay_ViPham.setAttribute('min', distance);
    ThoiGianBay_ViPham_DeXuat.innerText = 'Y??u c???u t???i thi???u: ' + distance + ' ph??t.';

    ThoiGianBay_ViPham_DeXuat.classList.add('text-danger');
}

if (ModalStaticChinhSua_Thoat) {
    ModalStaticChinhSua_Thoat.addEventListener('click', (e) => {
        SendForm_HuyChinhSua();
    });
}

if (ModalStaticChinhSua_Luu) {
    ModalStaticChinhSua_Luu.addEventListener('click', (e) => {
        SendForm_Luu();
    });
}
