# Routes301 / RoutesCC Driver Matching Software

## Iteration 2 - Review & Retrospect

 * When: **Sun, Mar. 14, 12pm (team) and Tuesday, Mar 16, 11am (with partner)**
 * Where: **Both meetings conducted on Zoom**

## Process - Reflection


#### Q1. Decisions that turned out well

*   For both the frontend and backend code base, we opted for a modular design, which has worked out really well.
    - Because of this design decision, we can freely modify parts of the application to improve it without needing
    to rewrite a large chunk of it. This has allowed us to make small incremental upgrades to our application with ease.

*   We had weekly Sunday group meetings and weekly Tuesday meetings with Niv (our partner)
	-   On Sundays, the frontend & backend teams have meetings separately. Each team discusses what they hope to achieve
	in the week, and divide up the work fairly between the members.
		-   Meeting every week and sharing our work was a good way to keep us invested in/up to date on the project
		and focused on making progress.
	-   On Tuesdays, the entire group meets with Niv, our contact at RoutesCC. During this time we update her on our
	progress and ask for clarifications on expected functionality of the app. These meetings are usually quite productive,
	and we get a lot of information exchanged each meeting, which is enough for us to continue improving our app during
	the week.

-   We had good code management and version control.
	-   We created separate branches for frontend and backend work. The group split into 2 teams and we worked on both sides efficiently.
	-   Some members focused all their attention on the backend and ignored the progress on the frontend or vice versa.
	    - This seemed to be quite a good arrangement as we were able to let everyone work on what they were more comfortable with
	    or what they wanted to do.
	-   When some significant milestone was reached in either branch, we merged it into the main branch to log our progress.
	-   Members from both groups oversaw merges so that no work would be overwritten during merges. Any merge conflicts were
	handled gracefully by everyone as well.

*   For communication we used Discord.
	-   We use a discord server to plan work and meetings. All 6 of us are active participants on the server.
		-   Reaching another member for clarifications on work and expectations is always quick and easy.
	-   There are channels for frontend, backend, and testing. Therefore, people can easily ignore conversations that are irrelevant to them.


#### Q2. Decisions that did not turn out as well as we hoped


-  We didn’t clearly articulate our goals for D2.
	-   We basically worked on the content for this deliverable within a 2-week period. Each week the frontend and
	backend team made goals for that week. There was no point where the entire group discussed and agreed on what we
	wanted our product to look like by the D2 deadline.
	    - This meant that while both teams made significant progress, we didn't have time to link up the frontend and
	    backend to have a fully functional application by the D2 deadline.
	-   We may have been able to integrate the backend and frontend work by the D2 deadline if we had been more coordinated.

*  Backend design decisions
    - In the backend, we created several object-oriented classes and methods that were not very intuitive for the other
    backend developers to understand (For example datareader.py is for reading csv files). These design decisions should
    have been communicated so that everyone is up to date.
    - The initial object files that were created didn't end up providing the functionality that we wanted. Closer to the
    deadline for D2, we decided to completely revamp the backend code by refactoring everything and removing unnecessary
    files. The end result was a much cleaner and much more functional backend.
    See [before](https://github.com/csc301-winter-2021/team-project-9-routes-connecting-communities/tree/6f51d2b3b17fcf5daed5c2c7db374ced2bad3b1e/backend/objects)
    and [after](https://github.com/csc301-winter-2021/team-project-9-routes-connecting-communities/tree/main/backend).
    We showed this new backend to our partner for our weekly meeting as well (elaborated below).
	-   We should have more clearly identified the inputs/outputs and expected behaviour of the backend before
	beginning to code, and we should have laid out a clear design before implementing anything.

-   We assigned members to a front-end team and back-end team but did not have anyone assigned to integrate the back-end
with the front-end. Due to this, we were not able to use Flask API in time to connect the back-end list of drivers and
rides with our web application.
	-   We should have planned the integration of front-end and back-end sooner and assigned the task to a member(s).


#### Q3. Planned changes

*   We are going to start using a Scrum workflow process. (We will complete 1 “sprint” by the deliverable-3 deadline)
	-   First we will meet with Niv to identify a list of remaining tasks, then add those tasks to the sprint backlog.
	This will give us clear expectations for what should be finished by the next iteration.
	-   While working on the sprint, we will meet regularly to ensure we are making progress and each task is delegated fairly.


-   We will create a virtual to-do list with high, medium, and low-priority tasks.
	-  This will ensure that everybody is on the same page in regards to progress and remaining work to do for the project.
	-   Important tasks will no longer be ignored in favour of lower-priority tasks.

*   We will clearly plan out our code base before we begin implementing anything, this will ensure that we do not waste
time writing redundant code that eventually ends up not being used. In order to do this, we will have meetings before
implementing any significant part of the project to come up with a design that everyone involved agrees on. This will mean
representing the code layout and features on paper or some digital medium so that we have a reference while actually doing
the implementation.

## Product - Review

#### Q4. How was your product demo?
 * How did you prepare your demo?
    - For this deliverable, we deployed our application using Heroku. So, as preparation, we simply had the application
    open on one of our machines in order to screen share and walk our partner through it. Some features from our
    backend had not yet made it into the deployed application, and as such we also had our backend code open and
    ready to run for our partner.
 * What did you manage to demo to your partner?
    - We walked our partner through the three main views in our deployed application: Suggested Matchings,
    View Volunteers, and View Trips. In the latter two views we demonstrated filtering through the listed volunteers
    and trips and selecting entries to view additional information. We also showed our partner the result from running
    the matching algorithm on sample data in the Python console, which outputted the rides and their suggested
    matchings, which matched our partners expectations.
 * Did your partner accept the features?
    - Our features and progress were accepted by our partner; the feedback we received mainly involved adding more
    elements and detail to them.
 * Were there change requests?
    - The Suggested Matchings view will be changed in order to more clearly display accepted trips versus suggested
    trips by overlaying the two in the calendar view. The page will also include more headers and labels to better
    describe the contents of the calendar view to the user. 
    - Both the View Volunteers and View Trips pages will be changed to include the means to add new data entries via
    our UI. We will also potentially add another view entirely dedicated to uploading files with new data.
    - We will implement basic login functionality with two users: an admin that can edit volunteer or trip information
    and a basic user who cannot.
    - For our demo, we only matched based on location; future iterations will take preferences and driver type into
    account, while also taking the availability of the driver into account as well.
    - The matching algorithm will be modified such that its constraints can be relaxed in the event that matchings
    are not found for every trip.

 * What did you learn from the demo from either a process or product perspective?
    - Presenting our demo showed us the value of having worked very closely with our partner throughout the previous
    weeks. During every weekly meeting both our team and partner have asked each other in-depth questions to solidify
    our respective understandings of the application, and as a result during our demo our partner knew what to expect
    and what needed to change. Our work process ensured that our partner was up to date on what we were doing and as
    a result, any change requests made were relatively minor and anticipated. This ensured that we did not come up with
    a product that was completely different from what our partner had in mind.
