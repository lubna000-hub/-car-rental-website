// ===================== الطلب 1.3: إظهار / إخفاء التفاصيل (jQuery) =====================
$(document).ready(function () {

    // تأثير jQuery عام على جميع الصفحات: ظهور تدريجي للبطاقات
    $(".hero, .intro-section, .section-card, .publish-card, .notes-card, .content-card").hide().fadeIn(600);

    // تمييز صفوف الجداول عند مرور المؤشر
    $(".data-table tbody tr, .team-table tbody tr").not(".details-row").hover(
        function () { $(this).css("background-color", "#eef3fb"); },
        function () { $(this).css("background-color", ""); }
    );

    // الصف التالي مباشرة للصف الحالي هو صف التفاصيل
    $(".details-toggle").on("change", function () {
        var detailsRow = $(this).closest("tr").next(".details-row");
        if ($(this).is(":checked")) {
            detailsRow.fadeIn(250);
        } else {
            detailsRow.fadeOut(200);
        }
    });

    // ===================== الطلب 1.4: زر المتابعة ونموذج الحجز =====================
    $("#continueBtn").on("click", function () {
        if ($("input[name='cars']:checked").length === 0) {
            $("#continueMsg").text("الرجاء اختيار سيارة واحدة على الأقل قبل المتابعة.");
            return;
        }
        $("#continueMsg").text("");
        showSelectedCars();
        $("#bookingSection").slideDown(400);
        $("html, body").animate({ scrollTop: $("#bookingSection").offset().top - 10 }, 400);
    });

    // تحديث قائمة السيارات المختارة إذا غيّر المستخدم اختياره بعد ظهور النموذج
    $("input[name='cars']").on("change", function () {
        if ($("#bookingSection").is(":visible")) {
            showSelectedCars();
        }
    });

    // إرسال النموذج
    $("#bookingForm").on("submit", function (event) {
        event.preventDefault();
        if (validateForm()) {
            showResult();
        }
    });

    $("#closeResult").on("click", function () {
        $("#resultOverlay").fadeOut(200);
    });
});

// ===================== دوال مساعدة =====================

// قراءة السيارات المختارة من الجدول
function getSelectedCars() {
    var cars = [];
    $("input[name='cars']:checked").each(function () {
        var row = $(this).closest("tr");
        cars.push({
            code: $(this).val(),
            model: row.find(".model").text(),
            price: parseInt(row.find(".price").text(), 10)
        });
    });
    return cars;
}

function showSelectedCars() {
    var cars = getSelectedCars();
    var names = [];
    for (var i = 0; i < cars.length; i++) {
        names.push(cars[i].model);
    }
    $("#selectedInfo").text("السيارات المختارة: " + (names.length ? names.join("، ") : "لا يوجد"));
}

// تحويل نص بصيغة yyyy-mm-dd إلى تاريخ (أو null إذا كان غير صحيح)
function parseDate(text) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (m === null) {
        return null;
    }
    var y = parseInt(m[1], 10);
    var mo = parseInt(m[2], 10);
    var d = parseInt(m[3], 10);
    var date = new Date(Date.UTC(y, mo - 1, d));
    // التأكد من أن التاريخ حقيقي (مثلاً 2026-02-31 مرفوض)
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
        return null;
    }
    return date;
}

function formatNumber(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function setError(field, message) {
    $("#err-" + field).text(message);
}

// ===================== التحقق من صحة الحقول =====================
function validateName(value) {
    if (value === "") {
        return "";                       // الحقل اختياري
    }
    var arabic = /^[ء-غف-ي]+( [ء-غف-ي]+)*$/;
    return arabic.test(value) ? "" : "الاسم يجب أن يحتوي أحرفاً عربية فقط (مع مسافات بين الكلمات).";
}

function validateNationalId(value) {
    if (value === "") {
        return "الرقم الوطني إلزامي.";
    }
    if (!/^\d{11}$/.test(value)) {
        return "الرقم الوطني يجب أن يتكون من 11 رقماً بالضبط.";
    }
    var province = parseInt(value.substring(0, 2), 10);
    if (province < 1 || province > 14) {
        return "أول خانتين (رمز المحافظة) يجب أن تكونا بين 01 و 14.";
    }
    return "";
}

function validateStart(value) {
    if (value === "") {
        return "تاريخ البداية إلزامي.";
    }
    if (parseDate(value) === null) {
        return "التاريخ غير صحيح، الصيغة المطلوبة yyyy-mm-dd.";
    }
    return "";
}

function validateEnd(value, startValue) {
    if (value === "") {
        return "تاريخ النهاية إلزامي.";
    }
    var end = parseDate(value);
    if (end === null) {
        return "التاريخ غير صحيح، الصيغة المطلوبة yyyy-mm-dd.";
    }
    var start = parseDate(startValue);
    if (start !== null && end <= start) {
        return "تاريخ النهاية يجب أن يكون لاحقاً لتاريخ البداية.";
    }
    return "";
}

function validateMobile(value) {
    if (value === "") {
        return "";                       // الحقل اختياري
    }
    // Syriatel: 093 / 098 / 099      MTN: 094 / 095 / 096
    var mobile = /^(\+963|00963|0)9[345689]\d{7}$/;
    return mobile.test(value) ? "" : "رقم غير مطابق لشبكتي Syriatel أو MTN (مثال: 0933123456).";
}

function validateEmail(value) {
    if (value === "") {
        return "";                       // الحقل اختياري
    }
    var email = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}$/;
    return email.test(value) ? "" : "البريد الإلكتروني غير صحيح.";
}

function validateForm() {
    var name = $.trim($("#fullName").val());
    var nid = $.trim($("#nationalId").val());
    var start = $.trim($("#startDate").val());
    var end = $.trim($("#endDate").val());
    var mobile = $.trim($("#mobile").val());
    var email = $.trim($("#email").val());

    var errors = {
        fullName: validateName(name),
        nationalId: validateNationalId(nid),
        startDate: validateStart(start),
        endDate: validateEnd(end, start),
        mobile: validateMobile(mobile),
        email: validateEmail(email)
    };

    var valid = true;
    for (var field in errors) {
        setError(field, errors[field]);
        if (errors[field] !== "") {
            valid = false;
        }
    }

    if (getSelectedCars().length === 0) {
        $("#selectedInfo").text("لا توجد سيارة مختارة، اختر سيارة واحدة على الأقل من الجدول.");
        valid = false;
    }
    return valid;
}

// ===================== نافذة النتيجة =====================
function showResult() {
    var cars = getSelectedCars();
    var start = parseDate($.trim($("#startDate").val()));
    var end = parseDate($.trim($("#endDate").val()));
    var days = Math.round((end - start) / 86400000);

    var total = 0;
    var html = "<table class='result-table'><tr><th>السيارة</th><th>السعر اليومي</th>" +
               "<th>عدد الأيام</th><th>الإجمالي</th></tr>";

    for (var i = 0; i < cars.length; i++) {
        var sub = cars[i].price * days;
        total += sub;
        html += "<tr><td>" + cars[i].model + "</td><td>" + formatNumber(cars[i].price) +
                " ل.س</td><td>" + days + "</td><td>" + formatNumber(sub) + " ل.س</td></tr>";
    }
    html += "</table>";

    var discount = 0;
    if (days > 10) {
        discount = total * 0.05;         // خصم 5% إذا تجاوزت مدة التأجير 10 أيام
    }
    var finalAmount = total - discount;

    html += "<p>المجموع قبل الخصم: <b>" + formatNumber(total) + " ل.س</b></p>";
    if (discount > 0) {
        html += "<p>خصم 5% (المدة أكثر من 10 أيام): <b>" + formatNumber(discount) + " ل.س</b></p>";
    } else {
        html += "<p>لا يوجد خصم (المدة 10 أيام أو أقل).</p>";
    }
    html += "<p class='final'>المبلغ النهائي: " + formatNumber(finalAmount) + " ل.س</p>";

    $("#resultContent").html(html);
    $("#resultOverlay").fadeIn(250);
}
