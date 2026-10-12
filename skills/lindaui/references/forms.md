# Forms

Use flat field contracts from the installed package. Input accepts label, value,
onChange(string), isInvalid and errorMessage; errorMessage only renders while
isInvalid is true. Textarea currently lacks an errorMessage prop: render linked
error text with a unique ID and aria-describedby. Select uses items/value/onChange.
Use Button type="submit" for a semantic form, rather than bypassing its submit event.

The contact-form recipe provides controlled name/email/message fields, required
and email validation, linked errors, asynchronous submission, disabled pending
button and server-error display. It accepts an onSubmit callback; adapt fields,
labels, successful-submit behavior and business validation to the actual request.
Do not leave fake endpoints or console logging as a completed submission flow.

Use the project's existing form library where appropriate. For react-hook-form,
use Controller to adapt string/boolean handlers, not DOM-event assumptions. Read
the installed block's API before adopting LoginForm or FieldArrayForm. Preserve
the app's schemas and error messages. Verify submit, invalid data, pending,
rejection, retry and keyboard interaction when the task requests verification.

Generated layouts use small structural CSS styles so they do not rely on arbitrary
consumer Tailwind utilities missing from the precompiled library bundle. Adapt
layout to the app's existing CSS conventions. Native form/paragraph containers
are appropriate around LindaUI controls.
