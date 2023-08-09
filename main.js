//Đối tượng `Validator`
function Validator(options){

    function getParent(element, selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    //Hàm thực hiên validate
    function validate(inputElement, rule) {
        //var errorElement = getParent(inputElement, '.form-group');
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        //Lấy ra các rule của selector
        var rules = selectorRules[rule.selector];

        //Lặp qua từng rule (check) //Nếu có lỗi thì dừng việc kiểm tra 
        for(var i=0; i<rules.length; i++){

            switch(inputElement.type){
                case 'radio':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                case 'checkbox':
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        }

        if(errorMessage){
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        }else{
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    //Lấy element của form validate
    var formElement = document.querySelector(options.form);
    if(formElement){
        //Xử lý submit
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function (rule) {
                inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if(!isValid){
                    isFormValid = false;
                }
            });

            if(isFormValid){
                //Submit data với JS
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])');

                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        values[input.name] = input.value;
                        return values;
                    }, {}); 
                   
                    options.onSubmit(formValues);
                }
                //Submit data với hành vi mặc định(HTML)
                else {
                    formElement.submit();
                }
            }
        }

        //Lặp qua từng rule và xử lý
        options.rules.forEach(function (rule) {

            //Lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }else{
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElement = formElement.querySelector(rule.selector);

            if(inputElement){
                //Xử lý trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                //Xử lý mỗi khi người dùng nhập vào input
                inputElement.oninput = function() {
                    errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            }
        });
    }

    //

}

Validator.isRequired = function(selector){
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này!';
        }
    }
}

Validator.isEmail = function(selector){
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Trường này phải là email!';
        }
    }
}

Validator.isPassword = function(selector, min){
    return {
        selector: selector,
        test: function (value) {
            var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])(?!.*\s).{8,}$/;
            return regex.test(value) && value.length >= min ? undefined : `Mật khẩu dài tối thiểu ${min} kí tự, có ít nhất 1 ký tự thường, hoa, đặc biêt, số!`;
        }
    }
}

Validator.isConfirmed = function(selector, password, message) {
    return {
        selector: selector,
        test: function(value) {
            var passwordConfirm = document.querySelector(Validator.isPassword(password).selector).value;
            return value === passwordConfirm ? undefined : message || `Mật khẩu không khớp!`;
        }
    }
}