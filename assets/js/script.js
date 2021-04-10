'use strict';

$(function (){
    let plannerData = {
        savedDayShedule: null,
        workingHours: ['9', '10', '11', '12', '13', '14', '15', '16', '17'],
        timeblocksListElem: $('.js-timeblocks-list'),
        formClass: 'js-scheduler-form',
        timeblockRecordClass: 'js-timeblock-records',
    };

    function displayCurrentDay() {
        console.log('%c Display Current Day ', 'background-color: #333; color: #4CB7EB;');
        $('.js-current-day').text(dayjs().format('dddd, MMMM Do'));
    }

    function renderTimeblocksList() {
        console.log('%c Render Timeblocks List ', 'background-color: #333; color: #4CB7EB;');

        for (let item of plannerData.workingHours) {
            let listItemElem = $('<li class="list-group-item p-0 mb-1 border-0">');

            let hour = dayjs().hour(item).format('hA'); // format hour to example - 11am,12pm,1pm and etc.
            let timeblockRecord = getSavedTimeblockRecord(hour);
            let timeblockClass = getTimeblockClass(item);

            listItemElem.append(`
                <form class="${plannerData.formClass}">
                    <div class="input-group ${timeblockClass}">
                        <label class="input-group-text justify-content-center hour" for="${hour}-plans">${hour}</label>
                        <textarea class="form-control hour-plans ${plannerData.timeblockRecordClass}" id="${hour}-plans" name="${hour}-plans" rows="3">${timeblockRecord ? timeblockRecord.plans : ''}</textarea>
                        <button class="btn btn-primary" type="submit"><i class="bi bi-calendar-plus"></i></button>
                    </div>
                </form>
            `);

            plannerData.timeblocksListElem.append(listItemElem);
        }
    }

    function saveTimeblockRecords(event) {
        console.log('%c Save Timeblock Record ', 'background-color: #333; color: #D96704;');
        event.preventDefault();

        let form = $(event.target);
        let timeblockHour = form.find('label').text();
        let timeblockRecord = form.find('textarea').val();
        let submitBtn = form.find('button[type="submit"]');

        getSavedDaySchedule();

        let daySchedule = plannerData.savedDayShedule || []; // use saved records or empty array
        let recordIndex = daySchedule.findIndex(item => item.hour === timeblockHour); // find a previous record item index by hour

        if (timeblockRecord !== '') {
            if (recordIndex < 0) {
                // if previous item not found
                daySchedule.push({
                    hour: timeblockHour,
                    plans: timeblockRecord,
                });
            } else {
                // if previous item found
                daySchedule[recordIndex].plans = timeblockRecord;
            }
        }

        if (timeblockRecord === '' && recordIndex >= 0) {
            // if clear out timeblock plans in textarea, we should remove a record about it, if it exist
            daySchedule.splice(recordIndex, 1);
        }

        if (submitBtn.hasClass('btn-warning')) {
            // back previous state of button after submit
            submitBtn
                .removeClass('btn-warning')
                .tooltip('dispose');
        }

        localStorage.setItem('daySchedule', JSON.stringify(daySchedule));
    }

    function getSavedTimeblockRecord(hour) {
        console.log('%c Get Saved Timeblock Record ', 'background-color: #333; color: #af3;');
        if (plannerData.savedDayShedule !== null) {
            // find record by hour, if have one return an record object, if not - return undefined
            return plannerData.savedDayShedule.find(item => item.hour === hour);
        }
    }

    function getTimeblockClass(hour) {
        console.log('%c Get Timeblock Class ', 'background-color: #333; color: #FF00CC;');
        let now = dayjs();
        let isPastHour = now.hour(hour).isBefore(now);
        let isFutureHour = now.hour(hour).isAfter(now);

        if (isPastHour) {
            return 'past-timeblock';
        } else if (isFutureHour) {
            return 'future-timeblock';
        } else {
            return 'present-timeblock';
        }
    }

    function getSavedDaySchedule() {
        console.log('%c Get Saved Day Schedule ', 'background-color: #333; color: #af3;');
        plannerData.savedDayShedule = JSON.parse(localStorage.getItem('daySchedule'));
    }

    function checkTimeblockRecordsChange(event) {
        console.log('%c Get Saved Day Schedule ', 'background-color: #333; color: #F2C8A2;');
        let timeblockRecordElem = $(event.target);
        let submitBtn = timeblockRecordElem.siblings('button[type="submit"]');

        // on change textarea change state of button
        submitBtn
            .addClass('btn-warning')
            .tooltip({
                title: "Save changes",
                placement: 'left'
            })
            .tooltip('show');

        setTimeout(() => submitBtn.tooltip('hide'), 2500);
    }

    function init() {
        console.log('%c Init ', 'background-color: #333; color: #FFE849;');

        displayCurrentDay();
        getSavedDaySchedule();
        renderTimeblocksList();
        plannerData.timeblocksListElem.on('submit', `.${plannerData.formClass}`, saveTimeblockRecords);
        plannerData.timeblocksListElem.on('change', `.${plannerData.timeblockRecordClass}`, checkTimeblockRecordsChange)
    }

    init();
});