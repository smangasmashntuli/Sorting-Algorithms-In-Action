const tabs = document.getElementById('tabs');
    const numbersInput = document.getElementById('numbersInput');
    const quickOptions = document.getElementById('quickOptions');
    const pivotStrategy = document.getElementById('pivotStrategy');
    const sortBtn = document.getElementById('sortBtn');
    const resetBtn = document.getElementById('resetBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const message = document.getElementById('message');
    const stepsContainer = document.getElementById('steps');
    const resultBox = document.getElementById('resultBox');
    const statAlgorithm = document.getElementById('statAlgorithm');
    const statSteps = document.getElementById('statSteps');
    const statTime = document.getElementById('statTime');
    const statLength = document.getElementById('statLength');

    let activeAlgorithm = 'bubble';

    const algorithmLabels = {
        bubble: 'Bubble Sort',
        selection: 'Selection Sort',
        insertion: 'Insertion Sort',
        quick: 'Quick Sort'
    };

    function setMessage(text, type = '') {
        message.textContent = text;
        message.className = `status ${type}`.trim();
    }

    function setActiveAlgorithm(name) {
        activeAlgorithm = name;

        tabs.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.algorithm === name);
        });

        quickOptions.classList.toggle('hidden', name !== 'quick');
        statAlgorithm.textContent = algorithmLabels[name];
        setMessage(`Selected ${algorithmLabels[name]}. Enter values and click Sort.`, 'success');
    }

    function parseNumbers(value) {
        const tokens = value.replace(/\n/g, ' ').split(/[\s,]+/).map(token => token.trim()).filter(Boolean);

        if (tokens.length === 0) {
            throw new Error('Please enter at least one number.');
        }

        return tokens.map(token => {
            const parsed = Number(token);
            if (!Number.isFinite(parsed)) {
                throw new Error(`"${token}" is not a valid number.`);
            }
            return parsed;
        });
    }

    function addStep(steps, array, note, meta = {}) {
        steps.push({
            array: array.slice(),
            note,
            sortedIndices: meta.sortedIndices ? meta.sortedIndices.slice() : [],
            compared: meta.compared ? meta.compared.slice() : [],
            swapped: meta.swapped ? meta.swapped.slice() : [],
            pivot: meta.pivot ?? null,
            keyIndex: meta.keyIndex ?? null,
            range: meta.range ? meta.range.slice() : []
        });
    }

    function bubbleSortSteps(input) {
        const arr = input.slice();
        const steps = [];
        addStep(steps, arr, 'Initial array');

        for (let i = 0; i < arr.length - 1; i++) {
            let swapped = false;

            for (let j = 0; j < arr.length - i - 1; j++) {
                addStep(steps, arr, `Compare ${arr[j]} and ${arr[j + 1]}`, {
                    compared: [j, j + 1],
                    sortedIndices: Array.from({ length: i }, (_, index) => arr.length - 1 - index)
                });

                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    swapped = true;
                    addStep(steps, arr, `Swap ${arr[j]} and ${arr[j + 1]}`, {
                        swapped: [j, j + 1],
                        sortedIndices: Array.from({ length: i }, (_, index) => arr.length - 1 - index)
                    });
                }
            }

            addStep(steps, arr, `End of pass ${i + 1}`, {
                sortedIndices: Array.from({ length: i + 1 }, (_, index) => arr.length - 1 - index)
            });

            if (!swapped) break;
        }

        addStep(steps, arr, 'Array is sorted', {
            sortedIndices: Array.from({ length: arr.length }, (_, index) => index)
        });

        return steps;
    }

    function selectionSortSteps(input) {
        const arr = input.slice();
        const steps = [];
        addStep(steps, arr, 'Initial array');

        for (let i = 0; i < arr.length - 1; i++) {
            let minIndex = i;
            const sortedPrefix = Array.from({ length: i }, (_, index) => index);

            addStep(steps, arr, `Pass ${i + 1}: search minimum for index ${i}`, {
                compared: [i],
                sortedIndices: sortedPrefix
            });

            for (let j = i + 1; j < arr.length; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                    addStep(steps, arr, `New minimum found at index ${minIndex}`, {
                        compared: [j, i],
                        sortedIndices: sortedPrefix
                    });
                }
            }

            if (minIndex !== i) {
                [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
                addStep(steps, arr, `Swap into position ${i}`, {
                    swapped: [i, minIndex],
                    sortedIndices: Array.from({ length: i + 1 }, (_, index) => index)
                });
            } else {
                addStep(steps, arr, `No swap needed in pass ${i + 1}`, {
                    sortedIndices: Array.from({ length: i + 1 }, (_, index) => index)
                });
            }
        }

        addStep(steps, arr, 'Array is sorted', {
            sortedIndices: Array.from({ length: arr.length }, (_, index) => index)
        });

        return steps;
    }

    function insertionSortSteps(input) {
        const arr = input.slice();
        const steps = [];
        addStep(steps, arr, 'Initial array');

        for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i - 1;
            addStep(steps, arr, `Pick key ${key}`, {
                keyIndex: i,
                sortedIndices: Array.from({ length: i }, (_, index) => index)
            });

            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                addStep(steps, arr, `Shift ${arr[j]} to the right`, {
                    compared: [j, j + 1],
                    keyIndex: j + 1,
                    sortedIndices: Array.from({ length: i }, (_, index) => index)
                });
                j--;
            }

            arr[j + 1] = key;
            addStep(steps, arr, `Insert ${key} in the correct place`, {
                keyIndex: j + 1,
                sortedIndices: Array.from({ length: i + 1 }, (_, index) => index)
            });
        }

        addStep(steps, arr, 'Array is sorted', {
            sortedIndices: Array.from({ length: arr.length }, (_, index) => index)
        });

        return steps;
    }

    function quickSortSteps(input, pivotMode) {
        const arr = input.slice();
        const steps = [];
        addStep(steps, arr, 'Initial array');

        function choosePivot(low, high) {
            if (pivotMode === 'start') return low;
            if (pivotMode === 'middle') return Math.floor((low + high) / 2);
            if (pivotMode === 'last') return high;
            return low + Math.floor(Math.random() * (high - low + 1));
        }

        function pivotLabel() {
            if (pivotMode === 'start') return 'start';
            if (pivotMode === 'middle') return 'middle';
            if (pivotMode === 'last') return 'last';
            return 'random';
        }

        function partition(low, high) {
            const chosenPivotIndex = choosePivot(low, high);
            const pivotValue = arr[chosenPivotIndex];

            addStep(steps, arr, `Choose ${pivotLabel()} pivot index ${chosenPivotIndex} (value ${pivotValue})`, {
                pivot: chosenPivotIndex,
                range: [low, high]
            });

            if (chosenPivotIndex !== high) {
                [arr[chosenPivotIndex], arr[high]] = [arr[high], arr[chosenPivotIndex]];
                addStep(steps, arr, `Move chosen pivot ${pivotValue} to the end for partitioning`, {
                    swapped: [chosenPivotIndex, high],
                    pivot: high,
                    range: [low, high]
                });
            }

            let storeIndex = low;
            for (let j = low; j < high; j++) {
                addStep(steps, arr, `Compare ${arr[j]} with pivot ${pivotValue}`, {
                    compared: [j, high],
                    pivot: high,
                    range: [low, high]
                });

                if (arr[j] <= pivotValue) {
                    if (storeIndex !== j) {
                        [arr[storeIndex], arr[j]] = [arr[j], arr[storeIndex]];
                        addStep(steps, arr, `Swap indexes ${storeIndex} and ${j}`, {
                            swapped: [storeIndex, j],
                            pivot: high,
                            range: [low, high]
                        });
                    }
                    storeIndex++;
                }
            }

            [arr[storeIndex], arr[high]] = [arr[high], arr[storeIndex]];
            addStep(steps, arr, `Place pivot ${pivotValue} at final index ${storeIndex}`, {
                swapped: [storeIndex, high],
                pivot: storeIndex,
                range: [low, high]
            });

            return storeIndex;
        }

        function quickSort(low, high) {
            if (low >= high) return;

            const pivotFinalIndex = partition(low, high);
            quickSort(low, pivotFinalIndex - 1);
            quickSort(pivotFinalIndex + 1, high);
        }

        quickSort(0, arr.length - 1);

        addStep(steps, arr, 'Array is sorted', {
            sortedIndices: Array.from({ length: arr.length }, (_, index) => index)
        });

        return steps;
    }

    function renderArray(array, meta = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'result-box';

        array.forEach((value, index) => {
            const box = document.createElement('div');
            box.className = 'array-box';
            box.textContent = value;
            box.dataset.index = index;

            if (meta.sortedIndices && meta.sortedIndices.includes(index)) box.classList.add('box-sorted');
            if (meta.compared && meta.compared.includes(index)) box.classList.add('box-compared');
            if (meta.swapped && meta.swapped.includes(index)) box.classList.add('box-swapped');
            if (meta.pivot === index) box.classList.add('box-pivot');
            if (meta.keyIndex === index) box.classList.add('box-key');

            wrapper.appendChild(box);
        });

        return wrapper;
    }

    function renderSteps(steps) {
        stepsContainer.innerHTML = '';

        steps.forEach((step, index) => {
            const card = document.createElement('div');
            card.className = 'step-card';

            const title = document.createElement('div');
            title.className = 'step-title';

            const heading = document.createElement('strong');
            heading.textContent = `Step ${index + 1}`;

            const note = document.createElement('span');
            note.className = 'step-note';
            note.textContent = step.note;

            title.appendChild(heading);
            title.appendChild(note);

            card.appendChild(title);
            card.appendChild(renderArray(step.array, step));
            stepsContainer.appendChild(card);
        });
    }

    function renderFinalResult(array) {
        resultBox.innerHTML = '';
        resultBox.appendChild(renderArray(array, { sortedIndices: array.map((_, index) => index) }));
    }

    function sort() {
        let numbers;

        try {
            numbers = parseNumbers(numbersInput.value);
        } catch (error) {
            setMessage(error.message, 'error');
            stepsContainer.innerHTML = '';
            resultBox.innerHTML = '';
            statSteps.textContent = '0';
            statTime.textContent = '0.00 ms';
            statLength.textContent = '0';
            return;
        }

        const start = performance.now();
        let steps = [];

        if (activeAlgorithm === 'bubble') {
            steps = bubbleSortSteps(numbers);
        } else if (activeAlgorithm === 'selection') {
            steps = selectionSortSteps(numbers);
        } else if (activeAlgorithm === 'insertion') {
            steps = insertionSortSteps(numbers);
        } else {
            steps = quickSortSteps(numbers, pivotStrategy.value);
        }

        const elapsed = performance.now() - start;
        const finalArray = steps.length ? steps[steps.length - 1].array : numbers.slice();

        renderSteps(steps);
        renderFinalResult(finalArray);

        statSteps.textContent = String(steps.length);
        statTime.textContent = `${elapsed.toFixed(2)} ms`;
        statLength.textContent = String(numbers.length);

        setMessage(`Sorted ${numbers.length} number(s) using ${algorithmLabels[activeAlgorithm]}.`, 'success');
    }

    function resetView() {
        numbersInput.value = '5, 2, 9, 1, 3';
        stepsContainer.innerHTML = '';
        resultBox.innerHTML = '';
        statSteps.textContent = '0';
        statTime.textContent = '0.00 ms';
        statLength.textContent = '0';
        setMessage('Reset the input. Choose an algorithm and click Sort.', '');
    }

    function loadSample() {
        const samples = {
            bubble: '8, 3, 7, 4, 9, 2, 6',
            selection: '29, 10, 14, 37, 13',
            insertion: '12, 11, 13, 5, 6',
            quick: '10, 7, 8, 9, 1, 5'
        };

        numbersInput.value = samples[activeAlgorithm];
        setMessage(`Loaded a sample for ${algorithmLabels[activeAlgorithm]}.`, 'success');
    }

    tabs.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-btn');
        if (!button) return;
        setActiveAlgorithm(button.dataset.algorithm);
    });

    sortBtn.addEventListener('click', sort);
    resetBtn.addEventListener('click', resetView);
    sampleBtn.addEventListener('click', loadSample);

    setActiveAlgorithm('bubble');
    renderFinalResult([5, 2, 9, 1, 3]);