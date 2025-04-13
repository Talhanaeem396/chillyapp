document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('scriptForm');
    const loadingState = document.getElementById('loadingState');
    const scriptOutput = document.getElementById('scriptOutput');
    const scriptContent = document.getElementById('scriptContent');
    const copyButton = document.getElementById('copyButton');
    const printButton = document.getElementById('printButton');
    const resetButton = document.getElementById('resetButton');
    const errorMessage = document.getElementById('errorMessage');

    // API endpoint - update this with your Cloudflare Worker URL
    const API_ENDPOINT = 'https://chilly-script-generator.chillyapp.workers.dev';

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    };

    const validateForm = (formData) => {
        const requiredFields = [
            'callerName',
            'callerTitle',
            'callerCompany',
            'prospectName',
            'prospectTitle',
            'prospectCompany',
            'industry',
            'tone',
            'painPoint'
        ];

        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        }
    };

    const generateScript = async (formData) => {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to generate script');
            }

            return data;
        } catch (error) {
            throw new Error(`Network error: ${error.message}`);
        }
    };

    const renderScript = (data) => {
        scriptContent.innerHTML = `
            <div class="space-y-6">
                <div class="script-section">
                    <h3>1. Introduction</h3>
                    <p class="mb-2">${data.script.introduction.opener}</p>
                    <p class="mb-2">${data.script.introduction.valueProposition}</p>
                </div>

                <div class="script-section">
                    <h3>2. Engagement Questions</h3>
                    <div class="response-options">
                        ${data.script.engagementQuestions.map(q => 
                            `<p class="question-item">${q}</p>`
                        ).join('')}
                    </div>
                </div>

                <div class="script-section">
                    <h3>3. Pain Point Discussion</h3>
                    <p class="mb-2">${data.script.painPointDiscussion.opener}</p>
                    <ul class="list-disc">
                        ${data.script.painPointDiscussion.questions.map(q => 
                            `<li>${q}</li>`
                        ).join('')}
                    </ul>
                </div>

                <div class="script-section">
                    <h3>4. Value Proposition</h3>
                    <p class="mb-2">${data.script.valueProposition.statement}</p>
                    <p class="positive-response">${data.script.valueProposition.benefit}</p>
                </div>

                <div class="script-section">
                    <h3>5. Handling Responses</h3>
                    <div class="response-options">
                        <p class="positive-response">If interested: ${data.script.responses.positive}</p>
                        <p class="neutral-response">If hesitant: ${data.script.responses.neutral}</p>
                        <p class="negative-response">If not interested: ${data.script.responses.negative}</p>
                    </div>
                </div>

                <div class="script-section">
                    <h3>6. Next Steps</h3>
                    <p class="mb-2">${data.script.nextSteps.proposal}</p>
                    <p class="positive-response">${data.script.nextSteps.callToAction}</p>
                </div>

                <div class="script-section">
                    <h3>7. Closing</h3>
                    <p>${data.script.closing}</p>
                </div>
            </div>
        `;
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        loadingState.classList.remove('hidden');
        scriptOutput.classList.add('hidden');
        errorMessage.classList.add('hidden');

        try {
            const formData = {
                callerName: document.getElementById('callerName').value.trim(),
                callerTitle: document.getElementById('callerTitle').value.trim(),
                callerCompany: document.getElementById('callerCompany').value.trim(),
                prospectName: document.getElementById('prospectName').value.trim(),
                prospectTitle: document.getElementById('prospectTitle').value.trim(),
                prospectCompany: document.getElementById('prospectCompany').value.trim(),
                industry: document.getElementById('industry').value,
                tone: document.getElementById('tone').value,
                painPoint: document.getElementById('painPoint').value,
                currentSolution: document.getElementById('currentSolution').value.trim()
            };

            validateForm(formData);
            const data = await generateScript(formData);
            renderScript(data);
            scriptOutput.classList.remove('hidden');

        } catch (error) {
            console.error('Error:', error);
            showError(`Error: ${error.message}`);
        } finally {
            loadingState.classList.add('hidden');
        }
    });

    copyButton.addEventListener('click', async () => {
        try {
            const textToCopy = scriptContent.innerText;
            await navigator.clipboard.writeText(textToCopy);
            
            const originalText = copyButton.innerText;
            copyButton.innerText = 'Copied!';
            copyButton.classList.add('button-success');
            
            setTimeout(() => {
                copyButton.innerText = originalText;
                copyButton.classList.remove('button-success');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            showError('Failed to copy script to clipboard');
        }
    });

    resetButton.addEventListener('click', () => {
        form.reset();
        scriptOutput.classList.add('hidden');
        errorMessage.classList.add('hidden');
    });

    printButton.addEventListener('click', () => {
        window.print();
    });
});
